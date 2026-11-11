import { useState, useEffect } from 'react';
import { Skull, DoorOpen, Trophy, Flame, Star } from 'lucide-react';
import { useT } from '../i18n';
import { LanguageSelector } from './LanguageSelector';
import { useMouseParallax } from '../hooks/useMouseParallax';
import { Particles3D } from './Particles3D';

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
  const { rotX, rotY, offsetX, offsetY, containerRef } = useMouseParallax(6);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
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
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden perspective-2000"
    >
      {/* Deep background layer */}
      <div
        className="absolute inset-0 depth-layer"
        style={{
          background: 'radial-gradient(ellipse at center, #1a0505 0%, #000000 70%)',
          transform: `translateZ(-100px) scale(1.15) translate(${offsetX * 0.3}px, ${offsetY * 0.3}px)`,
        }}
      />

      {/* Mid-layer floating structures */}
      <div
        className="absolute inset-0 depth-layer preserve-3d"
        style={{
          transform: `translateZ(-50px) translate(${offsetX * 0.5}px, ${offsetY * 0.5}px)`,
        }}
      >
        {/* Dark hallway arches - silhouettes */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-t-full"
            style={{
              left: `${15 + i * 18}%`,
              top: '20%',
              width: '12%',
              height: '60%',
              background: 'radial-gradient(ellipse at center bottom, rgba(40,5,5,0.6) 0%, transparent 70%)',
              transform: `translateZ(${i * 10 - 20}px)`,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      {/* Floating ember particles */}
      <Particles3D count={50} color="#e94560" sizeRange={[2, 5]} speed={0.8} zIndex={2} />

      {/* Decorative skull far back */}
      <div
        className="absolute depth-layer preserve-3d"
        style={{
          transform: `translateZ(-80px) scale(2.5) translate(${offsetX * 0.4}px, ${offsetY * 0.4}px)`,
          opacity: 0.04,
        }}
      >
        <Skull className="w-96 h-96 text-red-900" strokeWidth={0.5} />
      </div>

      {/* Main content with 3D parallax */}
      <div
        className="relative z-10 flex flex-col items-center depth-layer preserve-3d"
        style={{
          transform: `translateZ(0) perspective(1500px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${offsetX}px, ${offsetY}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Skull icon with float */}
        <div className={`preserve-3d transition-opacity duration-75 ${flicker ? 'opacity-40' : 'opacity-100'} ${showContent ? 'animate-title-enter' : 'opacity-0'}`}
          style={{ transformStyle: 'preserve-3d' }}>
          <div className="animate-float-3d preserve-3d">
            <Skull
              className="w-20 h-20 text-red-800 mx-auto mb-6 animate-pulse"
              strokeWidth={1}
              style={{ filter: 'drop-shadow(0 10px 30px rgba(200,0,0,0.4))' }}
            />
          </div>
        </div>

        <h1
          className={`text-5xl md:text-7xl font-bold text-red-900 tracking-widest mb-2 transition-opacity duration-75 ${flicker ? 'opacity-40' : 'opacity-100'} ${showContent ? 'animate-title-enter' : 'opacity-0'}`}
          style={{
            fontFamily: 'Georgia, serif',
            textShadow: '0 0 40px rgba(200,0,0,0.5), 0 0 80px rgba(150,0,0,0.3), 0 15px 40px rgba(0,0,0,0.8)',
            transform: 'translateZ(40px)',
            animationDelay: '0.2s',
          }}
        >
          {t.title}
        </h1>

        <p
          className={`text-red-800/60 text-lg tracking-[0.3em] mb-12 uppercase ${showContent ? 'animate-fade-up-3d' : 'opacity-0'}`}
          style={{
            textShadow: '0 0 20px rgba(200,0,0,0.3)',
            transform: 'translateZ(20px)',
            animationDelay: '0.6s',
          }}
        >
          {t.subtitle}
        </p>

        {/* Interactive controls panel */}
        <div
          className={`flex flex-col items-center gap-4 mb-8 w-full max-w-xs transition-all duration-700 ${showContent ? 'animate-fade-up-3d' : 'opacity-0'}`}
          style={{ transform: 'translateZ(30px)', animationDelay: '0.9s' }}
        >
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder={t.enterName}
            maxLength={20}
            className="w-full px-4 py-3 bg-black/80 border border-red-900/40 text-red-200 placeholder-red-900/40 rounded text-center focus:outline-none focus:border-red-700/60 transition-all duration-300"
            style={{
              textShadow: '0 0 10px rgba(200,0,0,0.2)',
              transform: 'translateZ(10px)',
            }}
          />

          <button
            onClick={handleStart}
            disabled={!playerName.trim()}
            className="btn-3d w-full px-6 py-3 bg-red-900/20 border border-red-800/50 text-red-600 rounded hover:bg-red-900/40 hover:border-red-700/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
            style={{
              textShadow: '0 0 10px rgba(200,0,0,0.3)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.6), 0 0 20px rgba(200,0,0,0.15)',
            }}
          >
            <DoorOpen className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="tracking-widest uppercase text-sm">{t.enterMansion}</span>
          </button>

          <button
            onClick={() => setHardcore(!hardcore)}
            className={`btn-3d w-full px-4 py-3 rounded border transition-all duration-300 flex items-center justify-center gap-2 ${hardcore ? 'bg-red-950/60 border-red-600/70 text-red-400' : 'bg-black/80 border-red-900/30 text-red-900/50 hover:text-red-700/60 hover:border-red-800/50'}`}
            style={hardcore ? { textShadow: '0 0 12px rgba(255,40,40,0.5)', boxShadow: '0 8px 25px rgba(100,0,0,0.5)' } : { boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}
          >
            <Flame className={`w-5 h-5 transition-transform ${hardcore ? 'scale-110' : ''}`} />
            <span className="tracking-widest uppercase text-xs">{hardcore ? t.hardcoreOn : t.hardcoreOff}</span>
          </button>

          <LanguageSelector variant="full" />
        </div>

        <button
          onClick={onShowLeaderboard}
          className="btn-3d px-4 py-2 text-red-900/50 hover:text-red-700/70 text-sm tracking-wider uppercase transition-colors flex items-center gap-2"
          style={{ transform: 'translateZ(15px)' }}
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
            <div className="flex items-center gap-4 text-xs text-amber-600/40 mt-4" style={{ transform: 'translateZ(10px)' }}>
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

      <div className="absolute bottom-4 text-red-900/20 text-xs tracking-widest z-10">
        {t.footerInfo}
      </div>
    </div>
  );
}
