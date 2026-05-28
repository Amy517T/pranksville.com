import { useState, useEffect } from 'react';
import { Crown, Timer, Heart, Trophy, RotateCcw, BookOpen } from 'lucide-react';
import type { GameState } from '../game/types';

interface VictoryProps {
  gameState: GameState;
  onRestart: () => void;
  onShowLeaderboard: () => void;
}

export function Victory({ gameState, onRestart, onShowLeaderboard }: VictoryProps) {
  const timeSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const endingNarrative = [
    'The heart shatters. The mansion screams — not in pain, but in recognition.',
    'It finally understands what it always was: not a house, but a hunger that learned to build walls.',
    'As the walls dissolve, you see them — Eleanor, the officer, the three who vanished — standing in the light. Free.',
    'They do not look at you. They are already gone.',
    'You stumble into the morning air. The gate behind you is rusted shut. The manor is a ruin — cracked stone and scattered wood, as if it had been abandoned for a century.',
    'But on the porch, you find a notebook. Eleanor\'s. The final page reads:',
    '"If you are reading this, you survived. But the house remembers you. It will rebuild. It always rebuilds. And when it does, it will remember your scent, your fears, your name. Don\'t come back. Don\'t ever come back."',
    'You walk to your car. The engine starts. The road home is long. You do not look back.',
    'But in the rearview mirror — just for a moment — you see the gate swing open again.',
  ];

  useEffect(() => {
    if (narrativeIndex < endingNarrative.length) {
      const delay = narrativeIndex < 3 ? 3000 : 2500;
      const timer = setTimeout(() => setNarrativeIndex(prev => prev + 1), delay);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowStats(true), 1000);
    }
  }, [narrativeIndex, endingNarrative.length]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black overflow-y-auto">
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, #1a1a0a 0%, #000000 70%)' }} />

      <div className="relative z-10 text-center px-8 max-w-lg py-12">
        <Crown className="w-20 h-20 mx-auto mb-6 text-amber-500"
          style={{ filter: 'drop-shadow(0 0 30px rgba(200,170,0,0.4))' }} />

        <h2 className="text-5xl font-bold mb-3 text-amber-400"
          style={{ textShadow: '0 0 40px rgba(200,170,0,0.5)', fontFamily: 'Georgia, serif' }}>
          YOU ESCAPED
        </h2>

        <p className="text-amber-600/60 mb-6 text-lg italic">
          Against all odds, you destroyed the heart and walked free.
        </p>

        {/* Ending narrative */}
        <div className="mb-8 space-y-3 text-left max-w-md mx-auto min-h-[120px]">
          {endingNarrative.slice(0, narrativeIndex).map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed transition-all duration-700"
              style={{
                color: i === narrativeIndex - 1 ? '#ccaa66' : '#887744',
                fontFamily: 'Georgia, serif',
                textShadow: i === endingNarrative.length - 1 ? '0 0 10px rgba(200,170,0,0.3)' : 'none',
                fontStyle: line.startsWith('"') ? 'italic' : 'normal',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {showStats && (
          <div>
            <div className="flex justify-center gap-8 mb-10">
              <div className="text-center">
                <Heart className="w-5 h-5 mx-auto mb-1 text-red-400" />
                <div className="text-2xl font-bold text-amber-400">{gameState.sanity}%</div>
                <div className="text-xs uppercase tracking-wider text-amber-600/40">Sanity</div>
              </div>
              <div className="text-center">
                <Timer className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-2xl font-bold text-amber-400">{minutes}:{seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs uppercase tracking-wider text-amber-600/40">Time</div>
              </div>
              <div className="text-center">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-2xl font-bold text-amber-400">{gameState.pranksTriggered.length}</div>
                <div className="text-xs uppercase tracking-wider text-amber-600/40">Pranks</div>
              </div>
              <div className="text-center">
                <BookOpen className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-2xl font-bold text-amber-400">{gameState.journalsFound.length}/10</div>
                <div className="text-xs uppercase tracking-wider text-amber-600/40">Journals</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onShowLeaderboard}
                className="px-6 py-3 rounded border border-amber-600/40 text-amber-500 bg-amber-600/10 text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 hover:border-amber-500/60 flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                View Leaderboard
              </button>

              <button
                onClick={onRestart}
                className="px-6 py-3 rounded border border-white/10 text-white/40 bg-white/5 text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
