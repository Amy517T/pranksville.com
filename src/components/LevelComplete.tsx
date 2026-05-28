import { useState, useEffect } from 'react';
import { ArrowRight, Skull, DoorOpen } from 'lucide-react';
import type { Level } from '../game/types';

interface LevelCompleteProps {
  level: Level;
  nextLevelName: string;
  sanity: number;
  onContinue: () => void;
}

export function LevelComplete({ level, nextLevelName, sanity, onContinue }: LevelCompleteProps) {
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (narrativeIndex < level.exitNarrative.length) {
      const timer = setTimeout(() => setNarrativeIndex(prev => prev + 1), 2500);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowStats(true), 800);
    }
  }, [narrativeIndex, level.exitNarrative.length]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${level.colorScheme.accent}10 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 text-center px-8 max-w-lg">
        <Skull className="w-16 h-16 mx-auto mb-6" style={{ color: level.colorScheme.accent, filter: `drop-shadow(0 0 20px ${level.colorScheme.glow})` }} />

        <p className="text-xs uppercase tracking-[0.5em] mb-2" style={{ color: level.colorScheme.accent + '50' }}>
          Level {level.id} Survived
        </p>

        <h2 className="text-4xl font-bold mb-3" style={{
          color: level.colorScheme.accent,
          textShadow: `0 0 30px ${level.colorScheme.glow}`,
          fontFamily: 'Georgia, serif',
        }}>
          {level.name}
        </h2>

        <p className="text-lg mb-6 italic" style={{ color: level.colorScheme.accent + '60' }}>
          "{level.subtitle}"
        </p>

        {/* Narrative transition */}
        <div className="mb-8 space-y-3 min-h-[80px]">
          {level.exitNarrative.slice(0, narrativeIndex).map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed transition-all duration-700"
              style={{
                color: i === narrativeIndex - 1 ? level.colorScheme.accent + 'cc' : level.colorScheme.accent + '50',
                fontFamily: 'Georgia, serif',
                textShadow: i === narrativeIndex - 1 ? `0 0 10px ${level.colorScheme.glow}` : 'none',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {showStats && (
          <>
            <div className="flex justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: level.colorScheme.accent }}>
                  {sanity}%
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: level.colorScheme.accent + '40' }}>
                  Sanity
                </div>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="px-8 py-4 rounded border-2 text-lg font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto"
              style={{
                borderColor: level.colorScheme.accent,
                color: level.colorScheme.accent,
                background: level.colorScheme.accent + '10',
                textShadow: `0 0 15px ${level.colorScheme.glow}`,
                boxShadow: `0 0 30px ${level.colorScheme.glow}`,
              }}
            >
              <DoorOpen className="w-5 h-5" />
              Enter: {nextLevelName}
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
