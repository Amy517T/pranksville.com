import { useState, useEffect } from 'react';
import { Crown, Timer, Heart, Trophy, RotateCcw, BookOpen, Star } from 'lucide-react';
import type { GameState } from '../game/types';
import { useT } from '../i18n';
import { Particles3D } from './Particles3D';

interface VictoryProps {
  gameState: GameState;
  onRestart: () => void;
  onShowLeaderboard: () => void;
}

export function Victory({ gameState, onRestart, onShowLeaderboard }: VictoryProps) {
  const t = useT();
  const timeSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const bestKey = gameState.hardcore ? 'pranksville_best_hardcore' : 'pranksville_best_normal';
  const bestTime = parseInt(localStorage.getItem(bestKey) || '0', 10);

  useEffect(() => {
    setIsNewBest(bestTime === 0 || timeSeconds <= bestTime);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const endingNarrative = [
    t.ending_1, t.ending_2, t.ending_3, t.ending_4,
    t.ending_5, t.ending_6, t.ending_7, t.ending_8, t.ending_9,
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black overflow-y-auto perspective-2000">
      <div
        className="absolute inset-0 depth-layer"
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a0a 0%, #000000 70%)',
          transform: 'translateZ(-100px) scale(1.15)',
        }}
      />

      {/* Golden floating particles */}
      <Particles3D count={40} color="#ffcc44" sizeRange={[2, 6]} speed={0.8} zIndex={2} />

      {/* Radiating light rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-amber-500/10"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              animation: `depthPulse ${4 + i}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-8 max-w-lg py-12 preserve-3d" style={{ transform: 'translateZ(30px)' }}>
        <div className="animate-vortex-spin mb-6">
          <Crown
            className="w-20 h-20 mx-auto text-amber-500 animate-float-3d"
            style={{ filter: 'drop-shadow(0 15px 40px rgba(200,170,0,0.4))', transformStyle: 'preserve-3d' }}
          />
        </div>

        <h2
          className="text-5xl font-bold mb-3 text-amber-400 animate-title-enter"
          style={{
            textShadow: '0 0 40px rgba(200,170,0,0.5), 0 15px 50px rgba(0,0,0,0.9)',
            fontFamily: 'Georgia, serif',
            transform: 'translateZ(40px)',
          }}
        >
          {t.youEscaped}
        </h2>

        <p
          className="text-amber-600/60 mb-6 text-lg italic animate-fade-up-3d"
          style={{ transform: 'translateZ(20px)', animationDelay: '0.3s' }}
        >
          {t.survivedPranks}
        </p>

        <div className="mb-8 space-y-3 text-left max-w-md mx-auto min-h-[120px]">
          {endingNarrative.slice(0, narrativeIndex).map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed transition-all duration-700 animate-text-reveal-3d"
              style={{
                color: i === narrativeIndex - 1 ? '#ccaa66' : '#887744',
                fontFamily: 'Georgia, serif',
                textShadow: i === endingNarrative.length - 1 ? '0 0 10px rgba(200,170,0,0.3)' : 'none',
                fontStyle: line.startsWith('"') || line.startsWith('\u201C') ? 'italic' : 'normal',
                transform: `translateZ(${i === narrativeIndex - 1 ? 25 : 10}px)`,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {showStats && (
          <div className="animate-emerge">
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center" style={{ transform: 'translateZ(20px)' }}>
                <Heart className="w-5 h-5 mx-auto mb-1 text-red-400" />
                <div className="text-2xl font-bold text-amber-400" style={{ textShadow: '0 0 15px rgba(200,170,0,0.4)' }}>{gameState.sanity}%</div>
                <div className="text-xs uppercase tracking-wider text-amber-600/40">{t.sanityStat}</div>
              </div>
              <div className="text-center" style={{ transform: 'translateZ(25px)' }}>
                <Timer className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-2xl font-bold text-amber-400" style={{ textShadow: '0 0 15px rgba(200,170,0,0.4)' }}>{minutes}:{seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs uppercase tracking-wider text-amber-600/40">{t.time}</div>
              </div>
              <div className="text-center" style={{ transform: 'translateZ(20px)' }}>
                <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-2xl font-bold text-amber-400" style={{ textShadow: '0 0 15px rgba(200,170,0,0.4)' }}>{gameState.pranksTriggered.length}</div>
                <div className="text-xs uppercase tracking-wider text-amber-600/40">{t.pranks}</div>
              </div>
              <div className="text-center" style={{ transform: 'translateZ(15px)' }}>
                <BookOpen className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="text-2xl font-bold text-amber-400" style={{ textShadow: '0 0 15px rgba(200,170,0,0.4)' }}>{gameState.journalsFound.length}/10</div>
                <div className="text-xs uppercase tracking-wider text-amber-600/40">{t.journals}</div>
              </div>
            </div>

            {bestTime > 0 && (
              <div className="flex items-center justify-center gap-2 mb-6 text-amber-500/60" style={{ transform: 'translateZ(10px)' }}>
                <Star className="w-4 h-4" />
                <span className="text-sm tracking-wider">
                  {t.bestTime}: {formatTime(bestTime)}
                </span>
                {isNewBest && (
                  <span className="text-xs text-green-400 font-bold animate-pulse ml-2">{t.newRecord}</span>
                )}
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onShowLeaderboard}
                className="btn-3d px-6 py-3 rounded border border-amber-600/40 text-amber-500 bg-amber-600/10 text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 hover:border-amber-500/60 flex items-center gap-2"
                style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.6), 0 0 15px rgba(200,170,0,0.2)' }}
              >
                <Trophy className="w-4 h-4" />
                {t.viewLeaderboard}
              </button>

              <button
                onClick={onRestart}
                className="btn-3d px-6 py-3 rounded border border-white/10 text-white/40 bg-white/5 text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 flex items-center gap-2"
                style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}
              >
                <RotateCcw className="w-4 h-4" />
                {t.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
