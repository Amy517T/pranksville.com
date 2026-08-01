import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, GamePhase, Room, JournalEntry } from './types';
import { levels } from './levels';

const initialState: GameState = {
  currentLevel: 1,
  currentRoom: 'foyer',
  sanity: 100,
  battery: 100,
  keysFound: 0,
  pranksTriggered: [],
  roomsVisited: ['foyer'],
  completed: false,
  playerName: '',
  startTime: Date.now(),
  inventory: [],
  journalsFound: [],
  hardcore: false,
};

interface PursuitState {
  active: boolean;
  roomId: string | null;
  roomsBehind: number;
  message: string;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [phase, setPhase] = useState<GamePhase>('title');
  const [scareMessage, setScareMessage] = useState('');
  const [scareType, setScareType] = useState<string>('jumpscare');
  const [pursuit, setPursuit] = useState<PursuitState>({ active: false, roomId: null, roomsBehind: 3, message: '' });
  const [pursuitWarningKey, setPursuitWarningKey] = useState('');
  const [ambushMessageKey, setAmbushMessageKey] = useState('');
  const [showAmbush, setShowAmbush] = useState(false);
  const [roomEntryMessageKey, setRoomEntryMessageKey] = useState('');

  const scareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passiveDrainRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pursuitTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ambushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLevel = levels[gameState.currentLevel - 1];
  const currentRoom: Room | undefined = currentLevel?.rooms[gameState.currentRoom];

  useEffect(() => {
    if (phase !== 'playing') {
      if (passiveDrainRef.current) clearInterval(passiveDrainRef.current);
      return;
    }
    passiveDrainRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.sanity <= 0) return prev;
        const baseDrain = 0.3 + (prev.currentLevel * 0.15);
        const sanityFactor = Math.max(0.5, prev.sanity / 100);
        const hardcoreMult = prev.hardcore ? 1.6 : 1;
        const drain = baseDrain * sanityFactor * hardcoreMult;
        const newSanity = Math.max(0, Math.round((prev.sanity - drain) * 10) / 10);
        const batteryDrain = prev.hardcore ? 2.5 : 1.5;
        const newBattery = Math.max(0, Math.round((prev.battery - batteryDrain) * 10) / 10);
        return { ...prev, sanity: newSanity, battery: newBattery };
      });
    }, 2000);
    return () => { if (passiveDrainRef.current) clearInterval(passiveDrainRef.current); };
  }, [phase]);

  useEffect(() => {
    if (gameState.sanity <= 0 && phase === 'playing') {
      setPhase('gameOver');
    }
  }, [gameState.sanity, phase]);

  useEffect(() => {
    if (phase !== 'playing') {
      if (pursuitTickRef.current) clearInterval(pursuitTickRef.current);
      setPursuit({ active: false, roomId: null, roomsBehind: 3, message: '' });
      return;
    }
    if (gameState.roomsVisited.length >= 3 && !pursuit.active) {
      setPursuit({ active: true, roomId: null, roomsBehind: 3, message: '' });
    }

    if (pursuit.active) {
      pursuitTickRef.current = setInterval(() => {
        setPursuit(prev => {
          const newBehind = prev.roomsBehind - 1;
          if (newBehind <= 0) {
            setGameState(gs => ({
              ...gs,
              sanity: Math.max(0, gs.sanity - 25),
            }));
            setPursuitWarningKey('pursuit_1');
            setTimeout(() => setPursuitWarningKey(''), 3000);
            return { active: true, roomId: null, roomsBehind: 3, message: '' };
          } else if (newBehind === 1) {
            setPursuitWarningKey('pursuit_2');
            setTimeout(() => setPursuitWarningKey(''), 3000);
          } else if (newBehind === 2) {
            setPursuitWarningKey('pursuit_3');
            setTimeout(() => setPursuitWarningKey(''), 2000);
          }
          return { ...prev, roomsBehind: newBehind };
        });
      }, 12000);
    }

    return () => { if (pursuitTickRef.current) clearInterval(pursuitTickRef.current); };
  }, [phase, pursuit.active, gameState.roomsVisited.length]);

  const startGame = useCallback((playerName: string, hardcore: boolean) => {
    const startSanity = hardcore ? 75 : 100;
    const startBattery = hardcore ? 75 : 100;
    setGameState({ ...initialState, playerName, startTime: Date.now(), hardcore, sanity: startSanity, battery: startBattery });
    setPhase('ad');
    setPursuit({ active: false, roomId: null, roomsBehind: 3, message: '' });
  }, []);

  const finishIntro = useCallback(() => {
    setPhase('playing');
  }, []);

  const moveToRoom = useCallback((roomId: string) => {
    setGameState(prev => {
      const newVisited = prev.roomsVisited.includes(roomId)
        ? prev.roomsVisited
        : [...prev.roomsVisited, roomId];
      const moveDrain = 1 + prev.currentLevel * 0.5 * (prev.hardcore ? 1.5 : 1);
      return {
        ...prev,
        currentRoom: roomId,
        roomsVisited: newVisited,
        sanity: Math.max(0, Math.round((prev.sanity - moveDrain) * 10) / 10),
      };
    });

    if (Math.random() < 0.3) {
      const idx = Math.floor(Math.random() * 10) + 1;
      setRoomEntryMessageKey(`entryScare_${idx}`);
      setTimeout(() => setRoomEntryMessageKey(''), 3000);
    }

    setPursuit(prev => {
      if (prev.active) {
        return { ...prev, roomsBehind: Math.min(prev.roomsBehind + 1, 4) };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (phase !== 'playing') {
      if (ambushTimeoutRef.current) clearTimeout(ambushTimeoutRef.current);
      return;
    }
    const scheduleAmbush = () => {
      const delay = 15000 + Math.random() * 30000;
      ambushTimeoutRef.current = setTimeout(() => {
        if (Math.random() < (gameState.hardcore ? 0.6 : 0.4)) {
          const idx = Math.floor(Math.random() * 10) + 1;
          const damages = [12, 10, 8, 15, 10, 8, 18, 14, 12, 16];
          const damage = damages[idx - 1] * (gameState.hardcore ? 1.5 : 1);
          setAmbushMessageKey(`ambush_${idx}`);
          setShowAmbush(true);
          setGameState(prev => ({
            ...prev,
            sanity: Math.max(0, prev.sanity - damage),
          }));
          setTimeout(() => { setShowAmbush(false); setAmbushMessageKey(''); }, 3500);
        }
        scheduleAmbush();
      }, delay);
    };
    scheduleAmbush();
    return () => { if (ambushTimeoutRef.current) clearTimeout(ambushTimeoutRef.current); };
  }, [phase]);

  const triggerPrank = useCallback((prank: Room['prank']) => {
    if (!prank) return;
    setGameState(prev => {
      if (prev.pranksTriggered.includes(prank.id)) return prev;
      const newSanity = Math.max(0, prev.sanity - prank.sanityDamage * (prev.hardcore ? 1.4 : 1));
      return {
        ...prev,
        sanity: newSanity,
        pranksTriggered: [...prev.pranksTriggered, prank.id],
      };
    });
    setScareMessage(prank.scareText);
    setScareType(prank.type);
    setPhase('scare');

    if (scareTimeoutRef.current) clearTimeout(scareTimeoutRef.current);
    scareTimeoutRef.current = setTimeout(() => {
      setGameState(prev => {
        if (prev.sanity <= 0) {
          setPhase('gameOver');
          return prev;
        }
        setPhase('playing');
        return prev;
      });
    }, prank.duration);
  }, []);

  const collectKey = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      keysFound: prev.keysFound + 1,
      sanity: Math.max(0, Math.round((prev.sanity - 3) * 10) / 10),
    }));
  }, []);

  const collectBattery = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      battery: Math.min(100, Math.round((prev.battery + 35) * 10) / 10),
    }));
  }, []);

  const collectItem = useCallback((item: string) => {
    setGameState(prev => {
      if (prev.inventory.includes(item)) return prev;
      return {
        ...prev,
        inventory: [...prev.inventory, item],
        sanity: Math.max(0, Math.round((prev.sanity - 1) * 10) / 10),
      };
    });
  }, []);

  const collectJournal = useCallback((journal: JournalEntry) => {
    setGameState(prev => {
      if (prev.journalsFound.find(j => j.id === journal.id)) return prev;
      return {
        ...prev,
        journalsFound: [...prev.journalsFound, journal],
      };
    });
  }, []);

  const advanceLevel = useCallback(() => {
    const nextLevel = gameState.currentLevel + 1;
    const maxLevel = gameState.hardcore ? levels.length : levels.length - 1;
    if (nextLevel > maxLevel) {
      setGameState(prev => ({ ...prev, completed: true }));
      setPhase('victory');
    } else {
      const nextLevelData = levels[nextLevel - 1];
      setGameState(prev => ({
        ...prev,
        currentLevel: nextLevel,
        currentRoom: nextLevelData.startRoom,
        keysFound: 0,
        roomsVisited: [nextLevelData.startRoom],
        sanity: Math.max(0, Math.round((prev.sanity - 5) * 10) / 10),
      }));
      setPursuit({ active: false, roomId: null, roomsBehind: 3, message: '' });
      setPhase('levelComplete');
    }
  }, [gameState.currentLevel, gameState.hardcore, setPhase]);

  const canAdvanceLevel = useCallback(() => {
    return gameState.keysFound >= currentLevel.requiredKeys;
  }, [gameState.keysFound, currentLevel]);

  const resetGame = useCallback(() => {
    if (scareTimeoutRef.current) clearTimeout(scareTimeoutRef.current);
    if (passiveDrainRef.current) clearInterval(passiveDrainRef.current);
    if (pursuitTickRef.current) clearInterval(pursuitTickRef.current);
    if (ambushTimeoutRef.current) clearTimeout(ambushTimeoutRef.current);
    setGameState(initialState);
    setPhase('title');
    setScareMessage('');
    setPursuit({ active: false, roomId: null, roomsBehind: 3, message: '' });
    setPursuitWarningKey('');
    setAmbushMessageKey('');
    setShowAmbush(false);
    setRoomEntryMessageKey('');
  }, []);

  return {
    gameState,
    phase,
    setPhase,
    scareMessage,
    scareType,
    currentLevel,
    currentRoom,
    startGame,
    finishIntro,
    moveToRoom,
    triggerPrank,
    collectKey,
    collectBattery,
    collectItem,
    collectJournal,
    advanceLevel,
    canAdvanceLevel,
    resetGame,
    pursuit,
    pursuitWarningKey,
    ambushMessageKey,
    showAmbush,
    roomEntryMessageKey,
  };
}
