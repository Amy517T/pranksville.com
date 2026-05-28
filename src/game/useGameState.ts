import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, GamePhase, Room, JournalEntry } from './types';
import { levels } from './levels';

const initialState: GameState = {
  currentLevel: 1,
  currentRoom: 'foyer',
  sanity: 100,
  keysFound: 0,
  pranksTriggered: [],
  roomsVisited: ['foyer'],
  completed: false,
  playerName: '',
  startTime: Date.now(),
  inventory: [],
  journalsFound: [],
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
  const [pursuitWarning, setPursuitWarning] = useState('');
  const [ambushMessage, setAmbushMessage] = useState('');
  const [showAmbush, setShowAmbush] = useState(false);
  const [roomEntryMessage, setRoomEntryMessage] = useState('');

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
        const drain = baseDrain * sanityFactor;
        const newSanity = Math.max(0, Math.round((prev.sanity - drain) * 10) / 10);
        return { ...prev, sanity: newSanity };
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
            setPursuitWarning('IT IS HERE. RUN.');
            setTimeout(() => setPursuitWarning(''), 3000);
            return { active: true, roomId: null, roomsBehind: 3, message: '' };
          } else if (newBehind === 1) {
            setPursuitWarning('It\'s right behind you.');
            setTimeout(() => setPursuitWarning(''), 3000);
          } else if (newBehind === 2) {
            setPursuitWarning('You hear footsteps matching yours.');
            setTimeout(() => setPursuitWarning(''), 2000);
          }
          return { ...prev, roomsBehind: newBehind };
        });
      }, 12000);
    }

    return () => { if (pursuitTickRef.current) clearInterval(pursuitTickRef.current); };
  }, [phase, pursuit.active, gameState.roomsVisited.length]);

  const startGame = useCallback((playerName: string) => {
    setGameState({ ...initialState, playerName, startTime: Date.now() });
    setPhase('intro');
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
      return {
        ...prev,
        currentRoom: roomId,
        roomsVisited: newVisited,
        sanity: Math.max(0, Math.round((prev.sanity - (1 + prev.currentLevel * 0.5)) * 10) / 10),
      };
    });

    if (Math.random() < 0.3) {
      const entryScareMessages = [
        'Something moved in the corner of your eye.',
        'You hear a door slam somewhere behind you.',
        'The temperature drops sharply as you enter.',
        'A shadow detaches from the wall and vanishes.',
        'Your ears pop as if the pressure changed.',
        'You feel watched by something just out of sight.',
        'A cold hand grazes the back of your neck.',
        'The floor groans under a weight that isn\'t yours.',
        'Whispered laughter fades as you cross the threshold.',
        'For a moment, you forgot your own name.',
      ];
      setRoomEntryMessage(entryScareMessages[Math.floor(Math.random() * entryScareMessages.length)]);
      setTimeout(() => setRoomEntryMessage(''), 3000);
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
        if (Math.random() < 0.4) {
          const ambushPranks = [
            { msg: 'A DECAPITATED HEAD rolls across the floor and stops at your feet, mouth moving silently.', damage: 12 },
            { msg: 'The walls BLEED. Thick, dark red liquid oozes from the wallpaper, the ceiling, the floor.', damage: 10 },
            { msg: 'Your own voice calls your name from the next room — but you haven\'t spoken.', damage: 8 },
            { msg: 'Every mirror in the mansion shatters simultaneously. The sound is deafening.', damage: 15 },
            { msg: 'A child\'s hand grabs your ankle from under the furniture. You look down — nothing is there.', damage: 10 },
            { msg: 'The lights go out for 5 seconds. When they return, the furniture has been rearranged.', damage: 8 },
            { msg: 'You feel a presence step INTO your body. For one second, you are not alone in your skin.', damage: 18 },
            { msg: 'A noose drops from the ceiling and lands around your neck. It tightens once, then releases.', damage: 14 },
            { msg: 'Blood drips from the ceiling onto your face. You look up — the ceiling is flesh now.', damage: 12 },
            { msg: 'Your shadow separates from you, walks to the corner, and turns to watch you.', damage: 16 },
          ];
          const prank = ambushPranks[Math.floor(Math.random() * ambushPranks.length)];
          setAmbushMessage(prank.msg);
          setShowAmbush(true);
          setGameState(prev => ({
            ...prev,
            sanity: Math.max(0, prev.sanity - prank.damage),
          }));
          setTimeout(() => { setShowAmbush(false); setAmbushMessage(''); }, 3500);
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
      const newSanity = Math.max(0, prev.sanity - prank.sanityDamage);
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
    if (nextLevel > levels.length) {
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
  }, [gameState.currentLevel, setPhase]);

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
    setPursuitWarning('');
    setAmbushMessage('');
    setShowAmbush(false);
    setRoomEntryMessage('');
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
    collectItem,
    collectJournal,
    advanceLevel,
    canAdvanceLevel,
    resetGame,
    pursuit,
    pursuitWarning,
    ambushMessage,
    showAmbush,
    roomEntryMessage,
  };
}
