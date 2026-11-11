import { useState, useEffect } from 'react';
import { DoorOpen, Key, Package, Eye, ArrowRight, BookOpen, Battery } from 'lucide-react';
import type { Room, Level, GameState, JournalEntry } from '../game/types';
import { useT } from '../i18n';
import { useMouseParallax } from '../hooks/useMouseParallax';
import { Particles3D } from './Particles3D';

interface RoomViewProps {
  room: Room;
  level: Level;
  gameState: GameState;
  onMoveToRoom: (roomId: string) => void;
  onTriggerPrank: (prank: Room['prank']) => void;
  onCollectKey: () => void;
  onCollectBattery: () => void;
  onCollectItem: (item: string) => void;
  onCollectJournal: (journal: JournalEntry) => void;
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
  onCollectBattery,
  onCollectItem,
  onCollectJournal,
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
  const [batteryCollected, setBatteryCollected] = useState(false);
  const [itemsCollected, setItemsCollected] = useState<string[]>([]);
  const [ambientFlicker, setAmbientFlicker] = useState(false);
  const [hoveredExit, setHoveredExit] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const t = useT();
  const [journalFound, setJournalFound] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { rotX, rotY, offsetX, offsetY, containerRef } = useMouseParallax(4);

  useEffect(() => {
    setRevealed(false);
    setExaminedPrank(false);
    setKeyCollected(false);
    setBatteryCollected(false);
    setItemsCollected([]);
    setJournalFound(false);
    setShowJournal(false);
    setExiting(false);
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

  useEffect(() => {
    if (gameState.sanity <= 25) {
      const shakeInterval = setInterval(() => {
        setShake(true);
        setTimeout(() => setShake(false), 200 + Math.random() * 300);
      }, 2000 + Math.random() * 3000);
      return () => clearInterval(shakeInterval);
    }
  }, [gameState.sanity]);

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

  const handleCollectBattery = () => {
    if (batteryCollected || !room.hasBattery) return;
    setBatteryCollected(true);
    onCollectBattery();
  };

  const handleCollectItem = (item: string) => {
    if (itemsCollected.includes(item)) return;
    setItemsCollected(prev => [...prev, item]);
    onCollectItem(item);
  };

  const handleMoveToRoom = (roomId: string) => {
    setExiting(true);
    setTimeout(() => onMoveToRoom(roomId), 400);
  };

  const atmosphereGradients: Record<string, string> = {
    eerie: 'radial-gradient(ellipse at 30% 40%, #1a0a1a 0%, #0a0a0a 60%, #000 100%)',
    dread: 'radial-gradient(ellipse at 50% 30%, #1a0505 0%, #0a0505 60%, #000 100%)',
    terror: 'radial-gradient(ellipse at 40% 50%, #200a0a 0%, #0a0505 60%, #000 100%)',
    nightmare: 'radial-gradient(ellipse at 60% 40%, #0a0a1a 0%, #05050a 60%, #000 100%)',
    void: 'radial-gradient(ellipse at 50% 50%, #050505 0%, #000000 100%)',
  };

  const sanityPercent = gameState.sanity;
  const batteryPercent = gameState.battery;
  const vignetteStrength = Math.max(0, (100 - sanityPercent) / 100);
  const staticIntensity = Math.max(0, (100 - sanityPercent) / 150);
  const redShift = Math.max(0, (100 - sanityPercent) / 200);
  const blurAmount = Math.max(0, (80 - sanityPercent) / 80) * 2;

  const lightFactor = Math.min(sanityPercent, batteryPercent) / 100;
  const visionRadius = 20 + lightFactor * 50;
  const darknessOpacity = 1 - lightFactor * 0.7;

  const exitRoomNames = room.exits.map(exitId => ({
    id: exitId,
    name: level.rooms[exitId]?.name || exitId,
    visited: gameState.roomsVisited.includes(exitId),
  }));

  const particleColor = level.colorScheme.accent;
  const isVoid = room.atmosphere === 'void';

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 flex flex-col perspective-2000 preserve-3d ${exiting ? 'animate-room-enter' : ''}`}
      style={{
        opacity: revealed ? 1 : 0,
        background: atmosphereGradients[room.atmosphere],
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
        transform: shake
          ? `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 8}px)`
          : exiting
            ? 'perspective(1200px) translateZ(200px) scale(1.1)'
            : `perspective(2000px) rotateX(${rotX * 0.5}deg) rotateY(${rotY * 0.5}deg)`,
        transition: shake ? 'none' : 'transform 0.4s ease-out, opacity 0.7s ease',
      }}
    >
      {/* Deep background wall layer */}
      <div
        className="absolute inset-0 depth-layer"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${level.colorScheme.primary}40 0%, transparent 60%)`,
          transform: `translateZ(-120px) scale(1.2) translate(${offsetX * 0.3}px, ${offsetY * 0.3}px)`,
        }}
      />

      {/* Mid-depth wall texture — silhouetted furniture/shapes */}
      <div
        className="absolute inset-0 depth-layer preserve-3d overflow-hidden"
        style={{
          transform: `translateZ(-60px) translate(${offsetX * 0.5}px, ${offsetY * 0.5}px)`,
        }}
      >
        {/* Floor perspective grid */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20"
          style={{
            background: `linear-gradient(to top, ${level.colorScheme.accent}15 0%, transparent 100%)`,
            transform: 'perspective(400px) rotateX(60deg) translateY(20%)',
            transformOrigin: 'bottom',
          }}
        />
        {/* Wall arches — depth silhouettes */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-t-full"
            style={{
              left: `${20 + i * 25}%`,
              top: '10%',
              width: '15%',
              height: '70%',
              background: `radial-gradient(ellipse at center bottom, ${level.colorScheme.primary}80 0%, transparent 70%)`,
              transform: `translateZ(${i * 15 - 30}px) translateX(${offsetX * 0.3}px)`,
              filter: 'blur(3px)',
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Floating dust/ember particles */}
      <Particles3D
        count={isVoid ? 25 : 35}
        color={particleColor}
        sizeRange={[1, 4]}
        speed={0.6}
        zIndex={2}
      />

      {/* Flashlight vision radius overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent ${visionRadius}%, rgba(0,0,0,${darknessOpacity}) ${visionRadius + 25}%)`,
        }}
      />

      {/* Vignette overlay */}
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
            style={{ textShadow: '0 0 30px rgba(255,0,0,0.8), 0 0 60px rgba(255,0,0,0.5)', transform: 'translateZ(50px)' }}>
            {pursuitWarning}
          </div>
        </div>
      )}

      {/* Room entry scare message */}
      {roomEntryMessage && (
        <div className="absolute top-16 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-red-400/80 text-sm italic text-center px-4 animate-pulse"
            style={{ textShadow: '0 0 10px rgba(255,0,0,0.5)', transform: 'translateZ(30px)' }}>
            {roomEntryMessage}
          </div>
        </div>
      )}

      {/* Ambush overlay */}
      {showAmbush && ambushMessage && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center pointer-events-none">
          <div className="max-w-lg px-6 text-center">
            <p className="text-red-500 text-lg font-bold animate-pulse"
              style={{ textShadow: '0 0 20px rgba(255,0,0,0.6)', fontFamily: 'Georgia, serif', transform: 'translateZ(40px)' }}>
              {ambushMessage}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-12 relative z-10">
        <div
          className="max-w-2xl w-full space-y-6 depth-layer preserve-3d"
          style={{
            transform: `translateZ(20px) translate(${offsetX * 0.8}px, ${offsetY * 0.8}px)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          <div className={`text-center mb-2 ${revealed ? 'animate-room-enter' : 'opacity-0'}`}>
            <span
              className="text-xs uppercase tracking-[0.4em] block mb-2"
              style={{ color: level.colorScheme.accent + '60', transform: 'translateZ(15px)' }}
            >
              {level.name}
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-1"
              style={{
                color: level.colorScheme.accent,
                textShadow: `0 0 30px ${level.colorScheme.glow}, 0 10px 30px rgba(0,0,0,0.7)`,
                fontFamily: 'Georgia, serif',
                transform: 'translateZ(30px)',
              }}
            >
              {room.name}
            </h2>
          </div>

          <div
            className={`text-base md:text-lg leading-relaxed px-2 ${revealed ? 'animate-text-reveal-3d' : 'opacity-0'}`}
            style={{
              color: '#a09090',
              textShadow: `0 0 10px ${level.colorScheme.glow}`,
              transform: 'translateZ(10px)',
              animationDelay: '0.3s',
            }}
          >
            {room.description}
          </div>

          <div
            className="px-2 py-2 rounded text-sm italic"
            style={{ color: level.colorScheme.accent + '50', transform: 'translateZ(5px)' }}
          >
            {room.ambientDescription}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {room.prank && !examinedPrank && (
              <button
                onClick={handleExamine}
                className="btn-3d flex items-center gap-2 px-4 py-2 rounded border transition-all duration-300 group animate-pulse"
                style={{
                  borderColor: level.colorScheme.accent + '40',
                  color: level.colorScheme.accent,
                  background: level.colorScheme.accent + '10',
                  boxShadow: `0 5px 20px rgba(0,0,0,0.5), 0 0 15px ${level.colorScheme.glow}`,
                }}
              >
                <Eye className="w-4 h-4 group-hover:animate-pulse" />
                <span className="text-sm">{t.examine}</span>
              </button>
            )}

            {room.hasKey && !keyCollected && (
              <button
                onClick={handleCollectKey}
                className="btn-3d flex items-center gap-2 px-4 py-2 rounded border border-amber-600/40 text-amber-500 bg-amber-600/10 transition-all duration-300 hover:border-amber-500/60 group animate-pulse"
                style={{ boxShadow: '0 5px 20px rgba(0,0,0,0.5), 0 0 12px rgba(200,150,0,0.2)' }}
              >
                <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="text-sm">{t.pickupKey}</span>
              </button>
            )}

            {room.hasBattery && !batteryCollected && (
              <button
                onClick={handleCollectBattery}
                className="btn-3d flex items-center gap-2 px-4 py-2 rounded border border-green-600/40 text-green-500 bg-green-600/10 transition-all duration-300 hover:border-green-500/60 group animate-pulse"
                style={{ boxShadow: '0 5px 20px rgba(0,0,0,0.5), 0 0 12px rgba(0,200,0,0.2)' }}
              >
                <Battery className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm">{t.pickupBattery}</span>
              </button>
            )}

            {room.items.filter(i => !itemsCollected.includes(i)).map(item => (
              <button
                key={item}
                onClick={() => handleCollectItem(item)}
                className="btn-3d flex items-center gap-2 px-4 py-2 rounded border border-white/10 text-white/60 bg-white/5 transition-all duration-300 hover:border-white/20"
                style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}
              >
                <Package className="w-4 h-4" />
                <span className="text-sm">{item}</span>
              </button>
            ))}

            {room.journalEntry && !journalFound && !gameState.journalsFound.find(j => j.id === room.journalEntry!.id) && (
              <button
                onClick={() => {
                  setJournalFound(true);
                  onCollectJournal(room.journalEntry!);
                  setShowJournal(true);
                }}
                className="btn-3d flex items-center gap-2 px-4 py-2 rounded border border-amber-700/40 text-amber-400 bg-amber-700/10 transition-all duration-300 hover:border-amber-600/60 group animate-pulse"
                style={{ boxShadow: '0 5px 20px rgba(0,0,0,0.5), 0 0 12px rgba(150,100,0,0.2)' }}
              >
                <BookOpen className="w-4 h-4 group-hover:rotate-3 transition-transform" />
                <span className="text-sm">{t.readNotebook}</span>
              </button>
            )}
          </div>

          {/* Journal display */}
          {showJournal && room.journalEntry && (
            <div
              className="mt-4 p-4 rounded border border-amber-700/30 space-y-2 panel-3d animate-card-flip-3d"
              style={{ background: 'rgba(30,20,5,0.8)', transform: 'translateZ(15px) perspective(800px)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-amber-500 text-sm font-bold flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
                  <BookOpen className="w-4 h-4" />
                  {room.journalEntry.title}
                </span>
                <button
                  onClick={() => setShowJournal(false)}
                  className="text-amber-700/40 hover:text-amber-500/60 text-xs transition-colors"
                >
                  {t.close}
                </button>
              </div>
              <p className="text-amber-300/50 text-sm leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
                {room.journalEntry.text}
              </p>
            </div>
          )}

          {canAdvanceLevel && (
            <div className="pt-4 text-center">
              <button
                onClick={onAdvanceLevel}
                className="btn-3d px-8 py-3 rounded border-2 text-lg font-bold tracking-wider uppercase transition-all duration-300 animate-depth-shimmer"
                style={{
                  borderColor: level.colorScheme.accent,
                  color: level.colorScheme.accent,
                  background: level.colorScheme.accent + '15',
                  textShadow: `0 0 15px ${level.colorScheme.glow}`,
                  '--glow': level.colorScheme.glow,
                } as React.CSSProperties}
              >
                {t.descendDeeper}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exit doors — 3D door buttons */}
      <div className="pb-24 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3" style={{ transform: `translateZ(10px) translateX(${offsetX * 0.4}px)` }}>
            <DoorOpen className="w-4 h-4" style={{ color: level.colorScheme.accent + '60' }} />
            <span className="text-xs uppercase tracking-[0.3em]" style={{ color: level.colorScheme.accent + '40' }}>
              {t.exits}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 perspective-1000">
            {exitRoomNames.map((exit, idx) => (
              <button
                key={exit.id}
                onClick={() => handleMoveToRoom(exit.id)}
                onMouseEnter={() => setHoveredExit(exit.id)}
                onMouseLeave={() => setHoveredExit(null)}
                className={`btn-3d flex items-center gap-2 px-4 py-2.5 rounded border transition-all duration-300 group ${revealed ? 'animate-fade-up-3d' : 'opacity-0'}`}
                style={{
                  borderColor: exit.visited ? level.colorScheme.accent + '30' : level.colorScheme.accent + '20',
                  color: exit.visited ? level.colorScheme.accent + '90' : level.colorScheme.accent + '50',
                  background: hoveredExit === exit.id ? level.colorScheme.accent + '15' : level.colorScheme.accent + '05',
                  transform: hoveredExit === exit.id
                    ? `perspective(600px) translateZ(20px) rotateY(-8deg) scale(1.05)`
                    : 'perspective(600px) translateZ(0)',
                  boxShadow: hoveredExit === exit.id
                    ? `0 10px 30px rgba(0,0,0,0.6), 0 0 20px ${level.colorScheme.glow}`
                    : '0 4px 12px rgba(0,0,0,0.5)',
                  animationDelay: `${0.4 + idx * 0.08}s`,
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
