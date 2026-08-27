import { useState, useEffect, useCallback } from 'react';
import { useGameState } from './game/useGameState';
import type { GamePhase } from './game/types';
import { levels } from './game/levels';
import { playAmbientDrone, playHeartbeat, playLowSanityDrone, playDistantScream, playStaticBurst, playViolinSting, playChildGiggle } from './lib/sounds';
import { useT } from './i18n';
import { TitleScreen } from './components/TitleScreen';
import { IntroSequence } from './components/IntroSequence';
import { RoomView } from './components/RoomView';
import { ScareOverlay } from './components/ScareOverlay';
import { HUD } from './components/HUD';
import { Minimap } from './components/Minimap';
import { Inventory } from './components/Inventory';
import { LevelComplete } from './components/LevelComplete';
import { GameOver } from './components/GameOver';
import { Victory } from './components/Victory';
import { Leaderboard, submitToLeaderboard } from './components/Leaderboard';
import { InstallPrompt } from './components/InstallPrompt';
import { AdOverlay } from './components/AdOverlay';

function App() {
  const t = useT();
  const {
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
    pursuitWarningKey,
    ambushMessageKey,
    showAmbush,
    roomEntryMessageKey,
  } = useGameState();

  const [showMap, setShowMap] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [afterAdPhase, setAfterAdPhase] = useState<GamePhase | null>(null);
  const [drone, setDrone] = useState<{ stop: () => void } | null>(null);
  const [lowSanityDrone, setLowSanityDrone] = useState<{ stop: () => void } | null>(null);
  const [heartbeatInterval, setHeartbeatInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Translate dynamic message keys
  const pursuitWarning = pursuitWarningKey ? (t as Record<string, string>)[pursuitWarningKey] || pursuitWarningKey : '';
  const ambushMessage = ambushMessageKey ? (t as Record<string, string>)[ambushMessageKey] || ambushMessageKey : '';
  const roomEntryMessage = roomEntryMessageKey ? (t as Record<string, string>)[roomEntryMessageKey] || roomEntryMessageKey : '';

  useEffect(() => {
    if (phase === 'playing' && !drone) {
      setDrone(playAmbientDrone());
    } else if (phase !== 'playing' && drone) {
      drone.stop();
      setDrone(null);
    }
    return () => { if (drone) drone.stop(); };
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && gameState.sanity <= 30 && !lowSanityDrone) {
      setLowSanityDrone(playLowSanityDrone());
    } else if ((phase !== 'playing' || gameState.sanity > 30) && lowSanityDrone) {
      lowSanityDrone.stop();
      setLowSanityDrone(null);
    }
    return () => {};
  }, [phase, gameState.sanity, lowSanityDrone]);

  useEffect(() => {
    if (phase !== 'playing' || gameState.sanity > 20) return;
    const effects = [playDistantScream, playStaticBurst, playViolinSting, playChildGiggle];
    const interval = setInterval(() => {
      const effect = effects[Math.floor(Math.random() * effects.length)];
      effect();
    }, 8000 + Math.random() * 7000);
    return () => clearInterval(interval);
  }, [phase, gameState.sanity]);

  useEffect(() => {
    if (phase !== 'playing') {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      return;
    }
    const rate = gameState.sanity > 60 ? 3000 : gameState.sanity > 30 ? 2000 : gameState.sanity > 10 ? 1000 : 600;
    const interval = setInterval(() => {
      playHeartbeat();
    }, rate);
    setHeartbeatInterval(interval);
    return () => clearInterval(interval);
  }, [phase, gameState.sanity]);

  useEffect(() => {
    document.title = phase === 'title'
      ? `${t.title} — ${t.subtitle}`
      : phase === 'scare'
      ? `!!! ${t.title} !!!`
      : `${t.title} — ${t.level} ${gameState.currentLevel}`;
  }, [phase, gameState.currentLevel, t]);

  useEffect(() => {
    document.body.style.cursor = phase === 'scare' ? 'crosshair' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [phase]);

  const handleStart = useCallback((playerName: string, hardcore: boolean) => {
    startGame(playerName, hardcore);
  }, [startGame]);

  const handleScareComplete = useCallback(() => {
    if (gameState.sanity <= 0) {
      setPhase('gameOver');
    } else {
      setPhase('playing');
    }
  }, [gameState.sanity, setPhase]);

  const handleAdvanceLevel = useCallback(() => {
    advanceLevel();
  }, [advanceLevel]);

  const handleContinueFromLevelComplete = useCallback(() => {
    setAfterAdPhase('playing');
    setPhase('ad');
  }, [setPhase]);

  useEffect(() => {
    if (phase === 'victory') {
      const timeSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
      submitToLeaderboard(
        gameState.playerName,
        gameState.hardcore ? 6 : 5,
        gameState.sanity,
        timeSeconds,
      );
      const key = gameState.hardcore ? 'pranksville_best_hardcore' : 'pranksville_best_normal';
      const existing = parseInt(localStorage.getItem(key) || '0', 10);
      if (existing === 0 || timeSeconds < existing) {
        localStorage.setItem(key, String(timeSeconds));
      }
    }
  }, [phase, gameState]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      {phase === 'title' && (
        <TitleScreen
          onStart={handleStart}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {phase === 'ad' && (
        <AdOverlay onComplete={() => {
          const next = afterAdPhase ?? 'intro';
          setAfterAdPhase(null);
          setPhase(next);
        }} />
      )}

      {phase === 'intro' && (
        <IntroSequence
          playerName={gameState.playerName}
          onComplete={finishIntro}
        />
      )}

      {phase === 'playing' && currentRoom && (
        <>
          <HUD
            gameState={gameState}
            currentLevel={currentLevel}
            onToggleMap={() => setShowMap(true)}
            onToggleInventory={() => setShowInventory(true)}
          />
          <RoomView
            room={currentRoom}
            level={currentLevel}
            gameState={gameState}
            onMoveToRoom={moveToRoom}
            onTriggerPrank={triggerPrank}
            onCollectKey={collectKey}
            onCollectBattery={collectBattery}
            onCollectItem={collectItem}
            onCollectJournal={collectJournal}
            onAdvanceLevel={handleAdvanceLevel}
            canAdvanceLevel={canAdvanceLevel()}
            pursuitWarning={pursuitWarning}
            ambushMessage={ambushMessage}
            showAmbush={showAmbush}
            roomEntryMessage={roomEntryMessage}
          />
        </>
      )}

      {phase === 'scare' && (
        <ScareOverlay
          message={scareMessage}
          type={scareType}
          onComplete={handleScareComplete}
        />
      )}

      {phase === 'levelComplete' && (
        <LevelComplete
          level={currentLevel}
          nextLevelName={t[`level_${gameState.currentLevel}_name` as keyof typeof t] || 'Unknown'}
          sanity={gameState.sanity}
          onContinue={handleContinueFromLevelComplete}
        />
      )}

      {phase === 'gameOver' && (
        <GameOver
          levelName={t[`level_${gameState.currentLevel}_name` as keyof typeof t] || currentLevel.name}
          pranksTriggered={gameState.pranksTriggered.length}
          gameState={gameState}
          onRestart={resetGame}
        />
      )}

      {phase === 'victory' && (
        <Victory
          gameState={gameState}
          onRestart={resetGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {showMap && phase === 'playing' && (
        <Minimap
          level={currentLevel}
          gameState={gameState}
          onClose={() => setShowMap(false)}
        />
      )}

      {showInventory && phase === 'playing' && (
        <Inventory
          gameState={gameState}
          level={currentLevel}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}

      <InstallPrompt />
    </div>
  );
}

export default App;
