import { Heart, Key, Map, Ghost, Briefcase } from 'lucide-react';
import type { GameState, Level } from '../game/types';

interface HUDProps {
  gameState: GameState;
  currentLevel: Level;
  onToggleMap: () => void;
  onToggleInventory: () => void;
}

export function HUD({ gameState, currentLevel, onToggleMap, onToggleInventory }: HUDProps) {
  const sanityColor = gameState.sanity > 60 ? '#44cc44' : gameState.sanity > 30 ? '#ccaa22' : '#cc3333';
  const sanityLabel = gameState.sanity > 60 ? 'Stable' : gameState.sanity > 30 ? 'Shaken' : gameState.sanity > 10 ? 'Terrified' : 'Breaking';

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-center justify-between px-4 py-3 pointer-events-auto"
        style={{ background: `linear-gradient(to bottom, ${currentLevel.colorScheme.primary}ee, transparent)` }}>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" style={{ color: sanityColor, filter: `drop-shadow(0 0 6px ${sanityColor})` }} />
            <div className="flex flex-col">
              <div className="w-32 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${gameState.sanity}%`,
                    backgroundColor: sanityColor,
                    boxShadow: `0 0 8px ${sanityColor}`,
                  }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: sanityColor }}>
                {sanityLabel} ({gameState.sanity}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5" style={{ color: currentLevel.colorScheme.accent }}>
            <Key className="w-4 h-4" />
            <span className="text-sm font-bold">{gameState.keysFound}/{currentLevel.requiredKeys}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm" style={{ color: currentLevel.colorScheme.accent }}>
          <Ghost className="w-4 h-4" />
          <span>Level {currentLevel.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleInventory}
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
            style={{ color: currentLevel.colorScheme.accent }}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-xs">{gameState.inventory.length}</span>
          </button>
          <button
            onClick={onToggleMap}
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
            style={{ color: currentLevel.colorScheme.accent }}
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
