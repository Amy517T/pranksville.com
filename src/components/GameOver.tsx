import { Skull, RotateCcw, BookOpen } from 'lucide-react';
import type { GameState } from '../game/types';
import { useT } from '../i18n';

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
      <div className="absolute inset-0 animate-pulse bg-red-900/10" />

      <div className="relative z-10 text-center px-8 max-w-lg">
        <Skull className="w-24 h-24 mx-auto mb-6 text-red-800" style={{ filter: 'drop-shadow(0 0 30px rgba(200,0,0,0.4))' }} />

        <h2 className="text-5xl font-bold mb-4 text-red-900"
          style={{ textShadow: '0 0 40px rgba(200,0,0,0.5)', fontFamily: 'Georgia, serif' }}>
          {t.sanityLost}
        </h2>

        <p className="text-lg text-red-800/60 mb-4">
          {t.mindFractured}
        </p>

        <div className="mb-6 space-y-3">
          {levelNarrative.map((line, i) => (
            <p key={i} className="text-sm italic text-red-700/50" style={{ fontFamily: 'Georgia, serif' }}>
              {line}
            </p>
          ))}
        </div>

        {gameState.journalsFound.length > 0 && (
          <div className="mb-6 flex items-center justify-center gap-2 text-red-800/30">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">{t.journals}: {gameState.journalsFound.length}/10</span>
          </div>
        )}

        <div className="mb-8 text-red-800/30 text-sm">
          {t.pranksSurvived}: {pranksTriggered}
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-4 rounded border-2 border-red-900/40 text-red-800 bg-red-900/10 text-lg font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 hover:border-red-700/60 flex items-center gap-3 mx-auto"
          style={{ textShadow: '0 0 15px rgba(200,0,0,0.3)' }}
        >
          <RotateCcw className="w-5 h-5" />
          {t.tryAgain}
        </button>
      </div>
    </div>
  );
}
