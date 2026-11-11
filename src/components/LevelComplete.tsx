import { useState, useEffect } from 'react';
import { ArrowRight, Skull, DoorOpen } from 'lucide-react';
import type { Level } from '../game/types';
import { useT } from '../i18n';
import { Particles3D } from './Particles3D';

interface LevelCompleteProps {
  level: Level;
  nextLevelName: string;
  sanity: number;
  onContinue: () => void;
}

export function LevelComplete({ level, nextLevelName, sanity, onContinue }: LevelCompleteProps) {
  const t = useT();
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const exitNarrative = [
    t[`level_${level.id}_exit_1` as keyof typeof t],
    t[`level_${level.id}_exit_2` as keyof typeof t],
    t[`level_${level.id}_exit_3` as keyof typeof t],
  ];

  useEffect(() => {
    if (narrativeIndex < exitNarrative.length) {
      const timer = setTimeout(() => setNarrativeIndex(prev => prev + 1), 2500);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowStats(true), 800);
    }
  }, [narrativeIndex, exitNarrative.length]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black perspective-2000">
      <div
        className="absolute inset-0 depth-layer"
        style={{
          background: `radial-gradient(ellipse at center, ${level.colorScheme.accent}10 0%, transparent 70%)`,
          transform: 'translateZ(-80px) scale(1.15)',
        }}
      />

      {/* Floating particles */}
      <Particles3D count={30} color={level.colorScheme.accent} sizeRange={[2, 5]} speed={0.7} zIndex={2} />

      <div className="relative z-10 text-center px-8 max-w-lg preserve-3d" style={{ transform: 'translateZ(30px)' }}>
        <div className="animate-emerge mb-6">
          <Skull
            className="w-16 h-16 mx-auto animate-float-3d"
            style={{
              color: level.colorScheme.accent,
              filter: `drop-shadow(0 10px 30px ${level.colorScheme.glow})`,
              transformStyle: 'preserve-3d',
            }}
          />
        </div>

        <p
          className="text-xs uppercase tracking-[0.5em] mb-2 animate-fade-up-3d"
          style={{ color: level.colorScheme.accent + '50', transform: 'translateZ(15px)' }}
        >
          {t.levelSurvived.replace('{level}', String(level.id))}
        </p>

        <h2
          className="text-4xl font-bold mb-3 animate-title-enter"
          style={{
            color: level.colorScheme.accent,
            textShadow: `0 0 30px ${level.colorScheme.glow}, 0 15px 40px rgba(0,0,0,0.8)`,
            fontFamily: 'Georgia, serif',
            transform: 'translateZ(40px)',
            animationDelay: '0.2s',
          }}
        >
          {t[`level_${level.id}_name` as keyof typeof t]}
        </h2>

        <p
          className="text-lg mb-6 italic animate-fade-up-3d"
          style={{
            color: level.colorScheme.accent + '60',
            transform: 'translateZ(20px)',
            animationDelay: '0.5s',
          }}
        >
          "{t[`level_${level.id}_subtitle` as keyof typeof t]}"
        </p>

        <div className="mb-8 space-y-3 min-h-[80px]">
          {exitNarrative.slice(0, narrativeIndex).map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed transition-all duration-700 animate-text-reveal-3d"
              style={{
                color: i === narrativeIndex - 1 ? level.colorScheme.accent + 'cc' : level.colorScheme.accent + '50',
                fontFamily: 'Georgia, serif',
                textShadow: i === narrativeIndex - 1 ? `0 0 10px ${level.colorScheme.glow}` : 'none',
                transform: `translateZ(${i === narrativeIndex - 1 ? 25 : 10}px)`,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {showStats && (
          <div className="animate-emerge">
            <div className="flex justify-center gap-8 mb-10">
              <div className="text-center" style={{ transform: 'translateZ(20px)' }}>
                <div className="text-2xl font-bold" style={{ color: level.colorScheme.accent, textShadow: `0 0 15px ${level.colorScheme.glow}` }}>
                  {sanity}%
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: level.colorScheme.accent + '40' }}>
                  {t.sanityStat}
                </div>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="btn-3d px-8 py-4 rounded border-2 text-lg font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto animate-depth-shimmer"
              style={{
                borderColor: level.colorScheme.accent,
                color: level.colorScheme.accent,
                background: level.colorScheme.accent + '10',
                textShadow: `0 0 15px ${level.colorScheme.glow}`,
                boxShadow: `0 0 30px ${level.colorScheme.glow}, 0 10px 30px rgba(0,0,0,0.7)`,
                '--glow': level.colorScheme.glow,
              } as React.CSSProperties}
            >
              <DoorOpen className="w-5 h-5" />
              {nextLevelName}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
