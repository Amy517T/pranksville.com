import { useEffect, useState } from 'react';
import { soundMap } from '../lib/sounds';

interface ScareOverlayProps {
  message: string;
  type: string;
  onComplete: () => void;
}

export function ScareOverlay({ message, type, onComplete }: ScareOverlayProps) {
  const [intensity, setIntensity] = useState(0);
  const [showText, setShowText] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [screenShake, setScreenShake] = useState(0);
  const [zoomPhase, setZoomPhase] = useState(true);

  useEffect(() => {
    const playSound = soundMap[type];
    if (playSound) playSound();

    setTimeout(() => setIntensity(1), 50);
    setTimeout(() => setShowText(true), 300);
    setTimeout(() => setZoomPhase(false), 600);

    const isJumpscare = type === 'jumpscare' || type === 'door_slam';
    if (isJumpscare) {
      setScreenShake(1);
      setTimeout(() => setScreenShake(0), 500);
    }

    const glitchInterval = setInterval(() => {
      const intensityFactor = isJumpscare ? 30 : 12;
      setGlitchOffset({
        x: (Math.random() - 0.5) * intensityFactor,
        y: (Math.random() - 0.5) * intensityFactor,
      });
    }, isJumpscare ? 50 : 100);

    return () => clearInterval(glitchInterval);
  }, [type]);

  const bgColor = (() => {
    switch (type) {
      case 'jumpscare': return 'bg-red-900/95';
      case 'possession': return 'bg-red-950/95';
      case 'shadow': return 'bg-gray-950/95';
      case 'mirror': return 'bg-blue-950/95';
      case 'whisper': return 'bg-green-950/95';
      case 'door_slam': return 'bg-amber-950/95';
      case 'illusion': return 'bg-violet-950/95';
      default: return 'bg-red-950/95';
    }
  })();

  const isJumpscare = type === 'jumpscare' || type === 'door_slam';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center perspective-2000 preserve-3d ${bgColor} transition-opacity duration-300`}
      style={{
        opacity: intensity,
        transform: `translate(${screenShake * (Math.random() - 0.5) * 20}px, ${screenShake * (Math.random() - 0.5) * 20}px) perspective(2000px)`,
      }}
      onClick={onComplete}
    >
      {isJumpscare && (
        <div className="absolute inset-0 animate-pulse bg-red-600/30" />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: isJumpscare
            ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.15) 2px, rgba(255,0,0,0.15) 4px)'
            : 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.02) 4px, rgba(255,255,255,0.02) 5px)',
        }}
      />

      {/* Chromatic aberration effect */}
      {isJumpscare && (
        <div className="absolute inset-0" style={{
          background: `linear-gradient(90deg, rgba(255,0,0,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,255,0.1) 100%)`,
          mixBlendMode: 'screen',
        }} />
      )}

      {/* Deep vortex background for possession */}
      {type === 'possession' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at center, transparent 20%, rgba(80,0,0,0.4) 50%, transparent 80%)',
            animation: 'slowPulse 2s ease-in-out infinite',
          }}
        >
          <div
            className="w-[600px] h-[600px] rounded-full border-2 border-red-900/20"
            style={{ animation: 'slowRotate3d 8s linear infinite' }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full border border-red-900/30"
            style={{ animation: 'slowRotate3d 6s linear infinite reverse' }}
          />
        </div>
      )}

      {/* Mirror fracture lines */}
      {type === 'mirror' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-blue-900/20"
              style={{
                left: `${10 + i * 12}%`,
                top: '0',
                width: '1px',
                height: '100%',
                transform: `rotate(${(Math.random() - 0.5) * 15}deg) translateZ(${Math.random() * 50}px)`,
                boxShadow: '0 0 20px rgba(100,100,255,0.3)',
              }}
            />
          ))}
        </div>
      )}

      {/* Shadow tendrils */}
      {type === 'shadow' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${15 + i * 15}%`,
                bottom: '0',
                width: '40px',
                height: '60%',
                background: 'radial-gradient(ellipse at bottom, rgba(0,0,0,0.8) 0%, transparent 70%)',
                transform: `translateZ(${Math.random() * 60}px) rotate(${(Math.random() - 0.5) * 20}deg)`,
                animation: `depthPulse ${3 + Math.random() * 2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main scare text with 3D zoom */}
      <div
        className={`relative z-10 max-w-2xl px-8 transition-all duration-500 ${showText ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${zoomPhase ? 'animate-scare-zoom-3d' : ''}`}
        style={{
          transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px) perspective(800px) translateZ(${isJumpscare ? 40 : 20}px)`,
          transition: 'opacity 0.3s',
        }}
      >
        <p
          className={`text-2xl md:text-3xl text-center leading-relaxed font-bold tracking-wide ${isJumpscare ? 'animate-pulse' : ''}`}
          style={{
            color: isJumpscare ? '#ff2222' : type === 'possession' ? '#ff4444' : '#cc9999',
            textShadow: `0 0 20px rgba(255,0,0,0.6), 0 0 40px rgba(200,0,0,0.4), 0 0 80px rgba(150,0,0,0.3), 0 10px 30px rgba(0,0,0,0.8)`,
            fontFamily: 'Georgia, serif',
          }}
        >
          {message}
        </p>
      </div>

      <div
        className="absolute bottom-8 text-white/20 text-sm tracking-widest animate-pulse"
        style={{ transform: 'translateZ(30px)' }}
      >
        CLICK TO SURVIVE
      </div>
    </div>
  );
}
