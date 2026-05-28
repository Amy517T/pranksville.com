import { Skull, RotateCcw } from 'lucide-react';

interface GameOverProps {
  levelName: string;
  pranksTriggered: number;
  onRestart: () => void;
}

export function GameOver({ levelName, pranksTriggered, onRestart }: GameOverProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
      <div className="absolute inset-0 animate-pulse bg-red-900/10" />

      <div className="relative z-10 text-center px-8 max-w-lg">
        <Skull className="w-24 h-24 mx-auto mb-6 text-red-800" style={{ filter: 'drop-shadow(0 0 30px rgba(200,0,0,0.4))' }} />

        <h2 className="text-5xl font-bold mb-4 text-red-900"
          style={{ textShadow: '0 0 40px rgba(200,0,0,0.5)', fontFamily: 'Georgia, serif' }}>
          SANITY LOST
        </h2>

        <p className="text-lg text-red-800/60 mb-2">
          Your mind has fractured beyond repair.
        </p>

        <p className="text-sm text-red-800/40 mb-8 italic">
          The mansion claimed another soul in the {levelName}.
        </p>

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
