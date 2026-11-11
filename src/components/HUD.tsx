import { Heart, Key, Map, Ghost, Briefcase, Timer, Battery } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { GameState, Level } from '../game/types';
import { useT, useI18n } from '../i18n';
import { LanguageSelector } from './LanguageSelector';

interface HUDProps {
  gameState: GameState;
  currentLevel: Level;
  onToggleMap: () => void;
  onToggleInventory: () => void;
}

export function HUD({ gameState, currentLevel, onToggleMap, onToggleInventory }: HUDProps) {
  const t = useT();
  const sanityColor = gameState.sanity > 60 ? '#44cc44' : gameState.sanity > 30 ? '#ccaa22' : '#cc3333';
  const sanityLabel = gameState.sanity > 60 ? t.stable : gameState.sanity > 30 ? t.shaken : gameState.sanity > 10 ? t.terrified : t.breaking;
  const batteryColor = gameState.battery > 50 ? '#44cc44' : gameState.battery > 20 ? '#ccaa22' : '#cc3333';

  const [elapsed, setElapsed] = useState(0);
  const [sanityPulse, setSanityPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - gameState.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.startTime]);

  useEffect(() => {
    if (gameState.sanity <= 30) {
      const pulse = setInterval(() => {
        setSanityPulse(true);
        setTimeout(() => setSanityPulse(false), 200);
      }, 2000 + Math.random() * 2000);
      return () => clearInterval(pulse);
    }
  }, [gameState.sanity]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none perspective-1000">
      <div
        className="flex items-center justify-between px-4 py-3 pointer-events-auto animate-slide-up preserve-3d"
        style={{
          background: `linear-gradient(to bottom, ${currentLevel.colorScheme.primary}ee, transparent)`,
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Sanity bar with 3D depth */}
          <div className="flex items-center gap-2" style={{ transform: 'translateZ(10px)' }}>
            <Heart
              className="w-5 h-5 transition-transform"
              style={{
                color: sanityColor,
                filter: `drop-shadow(0 0 6px ${sanityColor})`,
                transform: sanityPulse ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.2s ease-out',
              }}
            />
            <div className="flex flex-col">
              <div className="w-32 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}>
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${gameState.sanity}%`,
                    backgroundColor: sanityColor,
                    boxShadow: `0 0 8px ${sanityColor}, 0 0 4px ${sanityColor}`,
                  }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: sanityColor, textShadow: `0 0 6px ${sanityColor}40` }}>
                {sanityLabel} ({gameState.sanity}%)
              </span>
            </div>
          </div>

          {/* Battery bar with 3D depth */}
          <div className="flex items-center gap-2" style={{ transform: 'translateZ(8px)' }}>
            <Battery className="w-5 h-5" style={{ color: batteryColor, filter: `drop-shadow(0 0 6px ${batteryColor})` }} />
            <div className="flex flex-col">
              <div className="w-24 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}>
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${gameState.battery}%`,
                    backgroundColor: batteryColor,
                    boxShadow: `0 0 8px ${batteryColor}`,
                  }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: batteryColor }}>
                {Math.round(gameState.battery)}%
              </span>
            </div>
          </div>

          {/* Key count with 3D icon */}
          <div className="flex items-center gap-1.5" style={{ color: currentLevel.colorScheme.accent, transform: 'translateZ(6px)' }}>
            <Key className="w-4 h-4" style={{ filter: `drop-shadow(0 0 4px ${currentLevel.colorScheme.glow})` }} />
            <span className="text-sm font-bold" style={{ textShadow: `0 0 8px ${currentLevel.colorScheme.glow}` }}>{gameState.keysFound}/{currentLevel.requiredKeys}</span>
          </div>
        </div>

        {/* Center info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: currentLevel.colorScheme.accent, transform: 'translateZ(5px)' }}>
            <Ghost className="w-4 h-4 animate-float-3d" style={{ filter: `drop-shadow(0 0 4px ${currentLevel.colorScheme.glow})` }} />
            <span>{t.level} {currentLevel.id}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: currentLevel.colorScheme.accent, transform: 'translateZ(5px)' }}>
            <Timer className="w-4 h-4" />
            <span className="font-mono font-bold" style={{ textShadow: `0 0 8px ${currentLevel.colorScheme.glow}` }}>{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Right controls with 3D buttons */}
        <div className="flex items-center gap-3">
          <LanguageSelector variant="compact" />
          <button
            onClick={onToggleInventory}
            className="btn-3d flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-all duration-300"
            style={{
              color: currentLevel.colorScheme.accent,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-xs">{gameState.inventory.length}</span>
          </button>
          <button
            onClick={onToggleMap}
            className="btn-3d flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-all duration-300"
            style={{
              color: currentLevel.colorScheme.accent,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
