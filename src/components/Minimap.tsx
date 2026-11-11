import { X } from 'lucide-react';
import type { Level, GameState } from '../game/types';
import { useT } from '../i18n';
import { useMouseParallax } from '../hooks/useMouseParallax';

interface MinimapProps {
  level: Level;
  gameState: GameState;
  onClose: () => void;
}

export function Minimap({ level, gameState, onClose }: MinimapProps) {
  const t = useT();
  const rooms = Object.values(level.rooms);
  const visitedRooms = gameState.roomsVisited;
  const levelName = t[`level_${level.id}_name` as keyof typeof t];
  const { rotX, rotY, containerRef } = useMouseParallax(3);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm perspective-2000">
      <div
        ref={containerRef}
        className="relative max-w-lg w-full mx-4 p-6 rounded-lg border animate-card-flip-3d preserve-3d"
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
          className="text-lg font-bold mb-4 tracking-wider"
          style={{
            color: level.colorScheme.accent,
            fontFamily: 'Georgia, serif',
            textShadow: `0 0 15px ${level.colorScheme.glow}`,
            transform: 'translateZ(20px)',
          }}
        >
          {levelName} — {t.map}
        </h3>

        <div className="grid grid-cols-3 gap-2" style={{ transformStyle: 'preserve-3d' }}>
          {rooms.map((room, idx) => {
            const isCurrent = room.id === gameState.currentRoom;
            const isVisited = visitedRooms.includes(room.id);
            const hasKey = room.hasKey && !gameState.keysFound >= level.requiredKeys;

            return (
              <div
                key={room.id}
                className={`p-2 rounded border text-xs transition-all duration-300 ${isCurrent ? 'scale-105' : ''}`}
                style={{
                  borderColor: isCurrent
                    ? level.colorScheme.accent
                    : isVisited
                    ? level.colorScheme.accent + '30'
                    : '#ffffff10',
                  background: isCurrent
                    ? level.colorScheme.accent + '20'
                    : isVisited
                    ? level.colorScheme.accent + '08'
                    : '#ffffff05',
                  color: isVisited ? level.colorScheme.accent + 'cc' : '#ffffff30',
                  boxShadow: isCurrent
                    ? `0 0 20px ${level.colorScheme.glow}, 0 5px 15px rgba(0,0,0,0.6)`
                    : '0 3px 10px rgba(0,0,0,0.4)',
                  transform: `translateZ(${isCurrent ? 25 : isVisited ? 10 : 0}px)`,
                  animation: `fadeUp3d 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.04}s both`,
                }}
              >
                <div className="font-bold truncate">{isVisited ? room.name : '???'}</div>
                {isVisited && (
                  <div className="flex items-center gap-1 mt-1">
                    {room.exits.length > 0 && (
                      <span className="text-[10px]" style={{ color: level.colorScheme.accent + '50' }}>
                        {room.exits.length} {t.exits.toLowerCase()}
                      </span>
                    )}
                    {hasKey && isVisited && (
                      <span className="text-[10px] text-amber-500">{t.keys}</span>
                    )}
                  </div>
                )}
                {isCurrent && (
                  <div className="mt-1 text-[10px] animate-pulse" style={{ color: level.colorScheme.accent }}>
                    {t.youAreHere}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="mt-4 flex items-center justify-between text-xs"
          style={{ color: level.colorScheme.accent + '50', transform: 'translateZ(10px)' }}
        >
          <span>{t.keys}: {gameState.keysFound}/{level.requiredKeys}</span>
          <span>{t.roomsVisited}: {visitedRooms.length}/{rooms.length}</span>
        </div>
      </div>
    </div>
  );
}
