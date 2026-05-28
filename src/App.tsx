import { useState, useEffect, useCallback } from 'react';
import { useGameState } from './game/useGameState';
import { levels } from './game/levels';
import { playAmbientDrone, playHeartbeat } from './lib/sounds';
import { TitleScreen } from './components/TitleScreen';
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

function App() {
  const {
    gameState,
    phase,
    setPhase,
    scareMessage,
    scareType,
    currentLevel,
    currentRoom,
    startGame,
    moveToRoom,
    triggerPrank,
    collectKey,
    collectItem,
    advanceLevel,
    canAdvanceLevel,
    resetGame,
    pursuitWarning,
    ambushMessage,
    showAmbush,
    roomEntryMessage,
  } = useGameState();

  const [showMap, setShowMap] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [drone, setDrone] = useState<{ stop: () => void } | null>(null);
  const [heartbeatInterval, setHeartbeatInterval] = useState<ReturnType<typeof setInterval> | null>(null);

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
      ? 'Pranksville — Manor of Cursed Pranks'
      : phase === 'scare'
      ? '!!! PRANKSVILLE !!!'
      : `Pranksville — Level ${gameState.currentLevel}`;
  }, [phase, gameState.currentLevel]);

  useEffect(() => {
    document.body.style.cursor = phase === 'scare' ? 'crosshair' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [phase]);

  const handleStart = useCallback((playerName: string) => {
    startGame(playerName);
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
    setPhase('playing');
  }, [setPhase]);

  useEffect(() => {
    if (phase === 'victory') {
      const timeSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
      submitToLeaderboard(
        gameState.playerName,
        5,
        gameState.sanity,
        timeSeconds,
      );
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
            onCollectItem={collectItem}
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
          nextLevelName={levels[gameState.currentLevel]?.name || 'Unknown'}
          sanity={gameState.sanity}
          onContinue={handleContinueFromLevelComplete}
        />
      )}

      {phase === 'gameOver' && (
        <GameOver
          levelName={currentLevel.name}
          pranksTriggered={gameState.pranksTriggered.length}
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
