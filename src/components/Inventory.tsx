import { X, Package } from 'lucide-react';
import type { GameState, Level } from '../game/types';
import { useT } from '../i18n';

interface InventoryProps {
  gameState: GameState;
  level: Level;
  onClose: () => void;
}

export function Inventory({ gameState, level, onClose }: InventoryProps) {
  const t = useT();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4 p-6 rounded-lg border"
        style={{
          borderColor: level.colorScheme.accent + '30',
          background: level.colorScheme.bg,
          boxShadow: `0 0 60px ${level.colorScheme.glow}`,
        }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold mb-4 tracking-wider flex items-center gap-2"
          style={{ color: level.colorScheme.accent, fontFamily: 'Georgia, serif' }}>
          <Package className="w-5 h-5" />
          {t.inventory}
        </h3>

        {gameState.inventory.length === 0 ? (
          <p className="text-sm" style={{ color: level.colorScheme.accent + '40' }}>
            {t.noItems}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gameState.inventory.map(item => (
              <div
                key={item}
                className="p-3 rounded border text-sm"
                style={{
                  borderColor: level.colorScheme.accent + '20',
                  background: level.colorScheme.accent + '08',
                  color: level.colorScheme.accent + 'cc',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t" style={{ borderColor: level.colorScheme.accent + '15' }}>
          <div className="text-xs space-y-1" style={{ color: level.colorScheme.accent + '50' }}>
            <div>{t.pranks}: {gameState.pranksTriggered.length}</div>
            <div>{t.roomsVisited}: {gameState.roomsVisited.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
