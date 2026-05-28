import { useState, useEffect } from 'react';
import { DoorOpen, Key, Package, Eye, ArrowRight } from 'lucide-react';
import type { Room, Level, GameState } from '../game/types';

interface RoomViewProps {
  room: Room;
  level: Level;
  gameState: GameState;
  onMoveToRoom: (roomId: string) => void;
  onTriggerPrank: (prank: Room['prank']) => void;
  onCollectKey: () => void;
  onCollectItem: (item: string) => void;
  onAdvanceLevel: () => void;
  canAdvanceLevel: boolean;
  pursuitWarning: string;
  ambushMessage: string;
  showAmbush: boolean;
  roomEntryMessage: string;
}

export function RoomView({
  room,
  level,
  gameState,
  onMoveToRoom,
  onTriggerPrank,
  onCollectKey,
  onCollectItem,
  onAdvanceLevel,
  canAdvanceLevel,
  pursuitWarning,
  ambushMessage,
  showAmbush,
  roomEntryMessage,
}: RoomViewProps) {
  const [revealed, setRevealed] = useState(false);
  const [examinedPrank, setExaminedPrank] = useState(false);
  const [keyCollected, setKeyCollected] = useState(false);
  const [itemsCollected, setItemsCollected] = useState<string[]>([]);
  const [ambientFlicker, setAmbientFlicker] = useState(false);
  const [hoveredExit, setHoveredExit] = useState<string | null>(null);

  useEffect(() => {
    setRevealed(false);
    setExaminedPrank(false);
    setKeyCollected(false);
    setItemsCollected([]);
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, [room.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setAmbientFlicker(true);
        setTimeout(() => setAmbientFlicker(false), 100 + Math.random() * 200);
      }
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  const handleExamine = () => {
    if (examinedPrank || !room.prank) return;
    setExaminedPrank(true);
    onTriggerPrank(room.prank);
  };

  const handleCollectKey = () => {
    if (keyCollected || !room.hasKey) return;
    setKeyCollected(true);
    onCollectKey();
  };

  const handleCollectItem = (item: string) => {
    if (itemsCollected.includes(item)) return;
    setItemsCollected(prev => [...prev, item]);
    onCollectItem(item);
  };

  const atmosphereGradients: Record<string, string> = {
    eerie: 'radial-gradient(ellipse at 30% 40%, #1a0a1a 0%, #0a0a0a 60%, #000 100%)',
    dread: 'radial-gradient(ellipse at 50% 30%, #1a0505 0%, #0a0505 60%, #000 100%)',
    terror: 'radial-gradient(ellipse at 40% 50%, #200a0a 0%, #0a0505 60%, #000 100%)',
    nightmare: 'radial-gradient(ellipse at 60% 40%, #0a0a1a 0%, #05050a 60%, #000 100%)',
    void: 'radial-gradient(ellipse at 50% 50%, #050505 0%, #000000 100%)',
  };

  // Sanity-based visual distortions
  const sanityPercent = gameState.sanity;
  const vignetteStrength = Math.max(0, (100 - sanityPercent) / 100);
  const staticIntensity = Math.max(0, (100 - sanityPercent) / 150);
  const redShift = Math.max(0, (100 - sanityPercent) / 200);
  const blurAmount = Math.max(0, (80 - sanityPercent) / 80) * 2;

  const exitRoomNames = room.exits.map(exitId => ({
    id: exitId,
    name: level.rooms[exitId]?.name || exitId,
    visited: gameState.roomsVisited.includes(exitId),
  }));

  return (
    <div
      className="fixed inset-0 flex flex-col transition-opacity duration-700"
      style={{
        opacity: revealed ? 1 : 0,
        background: atmosphereGradients[room.atmosphere],
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
      }}
    >
      {/* Vignette overlay - gets worse as sanity drops */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent ${30 - vignetteStrength * 30}%, rgba(0,0,0,${vignetteStrength * 0.8}) 100%)`,
        }}
      />

      {/* Red shift for low sanity */}
      {redShift > 0 && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            background: `rgba(${Math.floor(redShift * 80)}, 0, 0, ${redShift * 0.15})`,
          }}
        />
      )}

      {/* Static noise for very low sanity */}
      {staticIntensity > 0.2 && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='${staticIntensity}'/%3E%3C/svg%3E")`,
            opacity: staticIntensity,
          }}
        />
      )}

      {/* Ambient flicker */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-100 ${ambientFlicker ? 'opacity-60' : 'opacity-0'}`}
        style={{ background: level.colorScheme.accent + '08' }}
      />

      {/* Pursuit warning overlay */}
      {pursuitWarning && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="text-red-600 text-2xl font-bold tracking-widest animate-pulse"
            style={{ textShadow: '0 0 30px rgba(255,0,0,0.8), 0 0 60px rgba(255,0,0,0.5)' }}>
            {pursuitWarning}
          </div>
        </div>
      )}

      {/* Room entry scare message */}
      {roomEntryMessage && (
        <div className="absolute top-16 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-red-400/80 text-sm italic text-center px-4 animate-pulse"
            style={{ textShadow: '0 0 10px rgba(255,0,0,0.5)' }}>
            {roomEntryMessage}
          </div>
        </div>
      )}

      {/* Ambush overlay */}
      {showAmbush && ambushMessage && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center pointer-events-none">
          <div className="max-w-lg px-6 text-center">
            <p className="text-red-500 text-lg font-bold animate-pulse"
              style={{ textShadow: '0 0 20px rgba(255,0,0,0.6)', fontFamily: 'Georgia, serif' }}>
              {ambushMessage}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-12 relative z-10">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center mb-2">
            <span
              className="text-xs uppercase tracking-[0.4em] block mb-2"
              style={{ color: level.colorScheme.accent + '60' }}
            >
              {level.name}
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-1"
              style={{
                color: level.colorScheme.accent,
                textShadow: `0 0 30px ${level.colorScheme.glow}`,
                fontFamily: 'Georgia, serif',
              }}
            >
              {room.name}
            </h2>
          </div>

          <div
            className="text-base md:text-lg leading-relaxed px-2"
            style={{
              color: '#a09090',
              textShadow: `0 0 10px ${level.colorScheme.glow}`,
            }}
          >
            {room.description}
          </div>

          <div className="px-2 py-2 rounded text-sm italic"
            style={{ color: level.colorScheme.accent + '50' }}>
            {room.ambientDescription}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {room.prank && !examinedPrank && (
              <button
                onClick={handleExamine}
                className="flex items-center gap-2 px-4 py-2 rounded border transition-all duration-300 hover:scale-105 group animate-pulse"
                style={{
                  borderColor: level.colorScheme.accent + '40',
                  color: level.colorScheme.accent,
                  background: level.colorScheme.accent + '10',
                  boxShadow: `0 0 15px ${level.colorScheme.glow}`,
                }}
              >
                <Eye className="w-4 h-4 group-hover:animate-pulse" />
                <span className="text-sm">{room.prank.triggerText}</span>
              </button>
            )}

            {room.hasKey && !keyCollected && (
              <button
                onClick={handleCollectKey}
                className="flex items-center gap-2 px-4 py-2 rounded border border-amber-600/40 text-amber-500 bg-amber-600/10 transition-all duration-300 hover:scale-105 hover:border-amber-500/60 group animate-pulse"
              >
                <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="text-sm">Pick up the key</span>
              </button>
            )}

            {room.items.filter(i => !itemsCollected.includes(i)).map(item => (
              <button
                key={item}
                onClick={() => handleCollectItem(item)}
                className="flex items-center gap-2 px-4 py-2 rounded border border-white/10 text-white/60 bg-white/5 transition-all duration-300 hover:scale-105 hover:border-white/20"
              >
                <Package className="w-4 h-4" />
                <span className="text-sm">{item}</span>
              </button>
            ))}
          </div>

          {canAdvanceLevel && (
            <div className="pt-4 text-center">
              <button
                onClick={onAdvanceLevel}
                className="px-8 py-3 rounded border-2 text-lg font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 animate-pulse"
                style={{
                  borderColor: level.colorScheme.accent,
                  color: level.colorScheme.accent,
                  background: level.colorScheme.accent + '15',
                  textShadow: `0 0 15px ${level.colorScheme.glow}`,
                  boxShadow: `0 0 30px ${level.colorScheme.glow}, inset 0 0 30px ${level.colorScheme.glow}`,
                }}
              >
                Descend Deeper
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pb-24 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <DoorOpen className="w-4 h-4" style={{ color: level.colorScheme.accent + '60' }} />
            <span className="text-xs uppercase tracking-[0.3em]" style={{ color: level.colorScheme.accent + '40' }}>
              Exits
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {exitRoomNames.map(exit => (
              <button
                key={exit.id}
                onClick={() => onMoveToRoom(exit.id)}
                onMouseEnter={() => setHoveredExit(exit.id)}
                onMouseLeave={() => setHoveredExit(null)}
                className="flex items-center gap-2 px-4 py-2.5 rounded border transition-all duration-300 group"
                style={{
                  borderColor: exit.visited ? level.colorScheme.accent + '30' : level.colorScheme.accent + '20',
                  color: exit.visited ? level.colorScheme.accent + '90' : level.colorScheme.accent + '50',
                  background: hoveredExit === exit.id ? level.colorScheme.accent + '15' : level.colorScheme.accent + '05',
                }}
              >
                <ArrowRight className={`w-3 h-3 transition-transform ${hoveredExit === exit.id ? 'translate-x-1' : ''}`} />
                <span className="text-sm">{exit.name}</span>
                {exit.visited && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: level.colorScheme.accent + '15' }}>
                    visited
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
