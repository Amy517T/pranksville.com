import { useState, useEffect } from 'react';
import { Skull, DoorOpen, Trophy, Flame, Star } from 'lucide-react';
import { useT } from '../i18n';
import { LanguageSelector } from './LanguageSelector';

interface TitleScreenProps {
  onStart: (playerName: string, hardcore: boolean) => void;
  onShowLeaderboard: () => void;
}

export function TitleScreen({ onStart, onShowLeaderboard }: TitleScreenProps) {
  const t = useT();
  const [playerName, setPlayerName] = useState('');
  const [hardcore, setHardcore] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
    const interval = setInterval(() => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 100);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (playerName.trim()) onStart(playerName.trim(), hardcore);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a0505_0%,_#000000_70%)]" />

      <div className={`relative z-10 flex flex-col items-center transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`transition-opacity duration-75 ${flicker ? 'opacity-40' : 'opacity-100'}`}>
          <Skull className="w-20 h-20 text-red-800 mx-auto mb-6 animate-pulse" strokeWidth={1} />
        </div>

        <h1 className={`text-5xl md:text-7xl font-bold text-red-900 tracking-widest mb-2 transition-opacity duration-75 ${flicker ? 'opacity-40' : 'opacity-100'}`}
          style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 40px rgba(200,0,0,0.5), 0 0 80px rgba(150,0,0,0.3)' }}>
          {t.title}
        </h1>

        <p className="text-red-800/60 text-lg tracking-[0.3em] mb-12 uppercase"
          style={{ textShadow: '0 0 20px rgba(200,0,0,0.3)' }}>
          {t.subtitle}
        </p>

        <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-xs">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder={t.enterName}
            maxLength={20}
            className="w-full px-4 py-3 bg-black/80 border border-red-900/40 text-red-200 placeholder-red-900/40 rounded text-center focus:outline-none focus:border-red-700/60 transition-colors"
            style={{ textShadow: '0 0 10px rgba(200,0,0,0.2)' }}
          />

          <button
            onClick={handleStart}
            disabled={!playerName.trim()}
            className="w-full px-6 py-3 bg-red-900/20 border border-red-800/50 text-red-600 rounded hover:bg-red-900/40 hover:border-red-700/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
            style={{ textShadow: '0 0 10px rgba(200,0,0,0.3)' }}
          >
            <DoorOpen className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="tracking-widest uppercase text-sm">{t.enterMansion}</span>
          </button>

          <button
            onClick={() => setHardcore(!hardcore)}
            className={`w-full px-4 py-3 rounded border transition-all duration-300 flex items-center justify-center gap-2 ${hardcore ? 'bg-red-950/60 border-red-600/70 text-red-400' : 'bg-black/80 border-red-900/30 text-red-900/50 hover:text-red-700/60 hover:border-red-800/50'}`}
            style={hardcore ? { textShadow: '0 0 12px rgba(255,40,40,0.5)' } : undefined}
          >
            <Flame className={`w-5 h-5 transition-transform ${hardcore ? 'scale-110' : ''}`} />
            <span className="tracking-widest uppercase text-xs">{hardcore ? t.hardcoreOn : t.hardcoreOff}</span>
          </button>

          <LanguageSelector variant="full" />
        </div>

        <button
          onClick={onShowLeaderboard}
          className="px-4 py-2 text-red-900/50 hover:text-red-700/70 text-sm tracking-wider uppercase transition-colors flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          {t.leaderboard}
        </button>

        {(() => {
          const bestNormal = parseInt(localStorage.getItem('pranksville_best_normal') || '0', 10);
          const bestHardcore = parseInt(localStorage.getItem('pranksville_best_hardcore') || '0', 10);
          const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
          if (bestNormal === 0 && bestHardcore === 0) return null;
          return (
            <div className="flex items-center gap-4 text-xs text-amber-600/40">
              {bestNormal > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {t.bestTime}: {formatTime(bestNormal)}
                </span>
              )}
              {bestHardcore > 0 && (
                <span className="flex items-center gap-1 text-red-500/40">
                  <Flame className="w-3 h-3" />
                  {t.bestTimeHardcore}: {formatTime(bestHardcore)}
                </span>
              )}
            </div>
          );
        })()}
      </div>

      <div className="absolute bottom-4 text-red-900/20 text-xs tracking-widest">
        {t.footerInfo}
      </div>
    </div>
  );
}
