import { Skull, RotateCcw, BookOpen } from 'lucide-react';
import type { GameState } from '../game/types';
import { useT } from '../i18n';
import { Particles3D } from './Particles3D';

interface GameOverProps {
  levelName: string;
  pranksTriggered: number;
  gameState: GameState;
  onRestart: () => void;
}

export function GameOver({ levelName, pranksTriggered, gameState, onRestart }: GameOverProps) {
  const t = useT();
  const levelNarrative = [
    t[`death_${gameState.currentLevel}_1` as keyof typeof t],
    t[`death_${gameState.currentLevel}_2` as keyof typeof t],
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black perspective-2000">
      <div
        className="absolute inset-0 animate-pulse bg-red-900/10 depth-layer"
        style={{ transform: 'translateZ(-100px) scale(1.15)' }}
      />

      {/* Drifting ash particles */}
      <Particles3D count={30} color="#aa0000" sizeRange={[2, 5]} speed={0.5} zIndex={2} />

      <div className="relative z-10 text-center px-8 max-w-lg preserve-3d" style={{ transform: 'translateZ(30px)' }}>
        <div className="animate-emerge mb-6">
          <Skull
            className="w-24 h-24 mx-auto text-red-800 animate-float-3d"
            style={{ filter: 'drop-shadow(0 15px 40px rgba(200,0,0,0.4))', transformStyle: 'preserve-3d' }}
          />
        </div>

        <h2
          className="text-5xl font-bold mb-4 text-red-900 animate-title-enter"
          style={{
            textShadow: '0 0 40px rgba(200,0,0,0.5), 0 15px 50px rgba(0,0,0,0.9)',
            fontFamily: 'Georgia, serif',
            transform: 'translateZ(40px)',
          }}
        >
          {t.sanityLost}
        </h2>

        <p
          className="text-lg text-red-800/60 mb-4 animate-fade-up-3d"
          style={{ transform: 'translateZ(15px)', animationDelay: '0.3s' }}
        >
          {t.mindFractured}
        </p>

        <div className="mb-6 space-y-3">
          {levelNarrative.map((line, i) => (
            <p
              key={i}
              className="text-sm italic text-red-700/50 animate-text-reveal-3d"
              style={{
                fontFamily: 'Georgia, serif',
                transform: `translateZ(${10 + i * 10}px)`,
                animationDelay: `${0.5 + i * 0.3}s`,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {gameState.journalsFound.length > 0 && (
          <div className="mb-6 flex items-center justify-center gap-2 text-red-800/30" style={{ transform: 'translateZ(15px)' }}>
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">{t.journals}: {gameState.journalsFound.length}/10</span>
          </div>
        )}

        <div className="mb-8 text-red-800/30 text-sm" style={{ transform: 'translateZ(10px)' }}>
          {t.pranksSurvived}: {pranksTriggered}
        </div>

        <button
          onClick={onRestart}
          className="btn-3d px-8 py-4 rounded border-2 border-red-900/40 text-red-800 bg-red-900/10 text-lg font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 hover:border-red-700/60 flex items-center gap-3 mx-auto"
          style={{
            textShadow: '0 0 15px rgba(200,0,0,0.3)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
          }}
        >
          <RotateCcw className="w-5 h-5" />
          {t.tryAgain}
        </button>
      </div>
    </div>
  );
}
