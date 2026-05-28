import { Skull, RotateCcw, BookOpen } from 'lucide-react';
import type { GameState } from '../game/types';

interface GameOverProps {
  levelName: string;
  pranksTriggered: number;
  gameState: GameState;
  onRestart: () => void;
}

const deathNarratives: Record<number, string[]> = {
  1: [
    'Your mind dissolves in the abandoned wing. The portraits on the walls now include yours — painted in the style of the 1800s, eyes following visitors who will never come.',
    'You tried to find the keys. Instead, the mansion found you.',
  ],
  2: [
    'The cellar claims your consciousness. Your bones settle into the walls, clicking into place alongside the others. Another brick in the foundation. Another voice in the dark.',
    'The officer who survived sat catatonic, repeating one word. You now know that word: "Hungry." The house is always hungry.',
  ],
  3: [
    'Your thoughts become whispers in the attic, joining the chorus of voices that never stop. The piano plays your final thought as a descending scale. The dolls bow.',
    'Eleanor heard you screaming from inside the walls. She couldn\'t help. She is the walls.',
  ],
  4: [
    'Your reflection steps out of the mirror, smooths your clothes, and walks into the world wearing your face. It does a better job of being you than you ever did.',
    'From inside the glass, you watch yourself leave. You will watch forever.',
  ],
  5: [
    'The heart absorbs you. Your heartbeat synchronizes for the last time, then becomes the mansion\'s rhythm. You are the house now. You will wait for the next visitor. You will be so welcoming.',
    'Eleanor tried to warn you. The walls whispered her warning. But the walls are her, and she was never trying to warn you. She was recruiting.',
  ],
};

export function GameOver({ levelName, pranksTriggered, gameState, onRestart }: GameOverProps) {
  const levelNarrative = deathNarratives[gameState.currentLevel] || deathNarratives[1];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
      <div className="absolute inset-0 animate-pulse bg-red-900/10" />

      <div className="relative z-10 text-center px-8 max-w-lg">
        <Skull className="w-24 h-24 mx-auto mb-6 text-red-800" style={{ filter: 'drop-shadow(0 0 30px rgba(200,0,0,0.4))' }} />

        <h2 className="text-5xl font-bold mb-4 text-red-900"
          style={{ textShadow: '0 0 40px rgba(200,0,0,0.5)', fontFamily: 'Georgia, serif' }}>
          SANITY LOST
        </h2>

        <p className="text-lg text-red-800/60 mb-4">
          Your mind has fractured beyond repair.
        </p>

        {/* Level-specific death narrative */}
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
            <span className="text-xs">Eleanor's journals discovered: {gameState.journalsFound.length}/10</span>
          </div>
        )}

        <div className="mb-8 text-red-800/30 text-sm">
          Pranks survived before breaking: {pranksTriggered}
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-4 rounded border-2 border-red-900/40 text-red-800 bg-red-900/10 text-lg font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 hover:border-red-700/60 flex items-center gap-3 mx-auto"
          style={{ textShadow: '0 0 15px rgba(200,0,0,0.3)' }}
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
