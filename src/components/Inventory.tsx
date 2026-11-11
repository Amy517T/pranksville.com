import { X, Package } from 'lucide-react';
import type { GameState, Level } from '../game/types';
import { useT } from '../i18n';
import { useMouseParallax } from '../hooks/useMouseParallax';

interface InventoryProps {
  gameState: GameState;
  level: Level;
  onClose: () => void;
}

export function Inventory({ gameState, level, onClose }: InventoryProps) {
  const t = useT();
  const { rotX, rotY, containerRef } = useMouseParallax(3);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm perspective-2000">
      <div
        ref={containerRef}
        className="relative max-w-md w-full mx-4 p-6 rounded-lg border animate-card-flip-3d preserve-3d"
        style={{
          borderColor: level.colorScheme.accent + '30',
          background: level.colorScheme.bg,
          boxShadow: `0 0 60px ${level.colorScheme.glow}, 0 20px 60px rgba(0,0,0,0.8)`,
          transform: `perspective(2000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <button
          onClick={onClose}
          className="btn-3d absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3
          className="text-lg font-bold mb-4 tracking-wider flex items-center gap-2"
          style={{
            color: level.colorScheme.accent,
            fontFamily: 'Georgia, serif',
            textShadow: `0 0 15px ${level.colorScheme.glow}`,
            transform: 'translateZ(20px)',
          }}
        >
          <Package className="w-5 h-5" />
          {t.inventory}
        </h3>

        {gameState.inventory.length === 0 ? (
          <p className="text-sm" style={{ color: level.colorScheme.accent + '40', transform: 'translateZ(10px)' }}>
            {t.noItems}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2" style={{ transformStyle: 'preserve-3d' }}>
            {gameState.inventory.map((item, idx) => (
              <div
                key={item}
                className="p-3 rounded border text-sm"
                style={{
                  borderColor: level.colorScheme.accent + '20',
                  background: level.colorScheme.accent + '08',
                  color: level.colorScheme.accent + 'cc',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  transform: 'translateZ(15px)',
                  animation: `fadeUp3d 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.06}s both`,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        <div
          className="mt-4 pt-4 border-t"
          style={{ borderColor: level.colorScheme.accent + '15', transform: 'translateZ(10px)' }}
        >
          <div className="text-xs space-y-1" style={{ color: level.colorScheme.accent + '50' }}>
            <div>{t.pranks}: {gameState.pranksTriggered.length}</div>
            <div>{t.roomsVisited}: {gameState.roomsVisited.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
