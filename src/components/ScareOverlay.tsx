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

  useEffect(() => {
    // Play the corresponding sound
    const playSound = soundMap[type];
    if (playSound) playSound();

    setTimeout(() => setIntensity(1), 50);
    setTimeout(() => setShowText(true), 300);

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
      className={`fixed inset-0 z-50 flex items-center justify-center ${bgColor} transition-opacity duration-300`}
      style={{
        opacity: intensity,
        transform: `translate(${screenShake * (Math.random() - 0.5) * 20}px, ${screenShake * (Math.random() - 0.5) * 20}px)`,
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

      <div
        className={`relative z-10 max-w-2xl px-8 transition-all duration-500 ${showText ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
          transition: 'opacity 0.3s',
        }}
      >
        <p
          className={`text-2xl md:text-3xl text-center leading-relaxed font-bold tracking-wide ${isJumpscare ? 'animate-pulse' : ''}`}
          style={{
            color: isJumpscare ? '#ff2222' : type === 'possession' ? '#ff4444' : '#cc9999',
            textShadow: `0 0 20px rgba(255,0,0,0.6), 0 0 40px rgba(200,0,0,0.4), 0 0 80px rgba(150,0,0,0.3)`,
            fontFamily: 'Georgia, serif',
          }}
        >
          {message}
        </p>
      </div>

      <div className="absolute bottom-8 text-white/20 text-sm tracking-widest animate-pulse">
        CLICK TO SURVIVE
      </div>
    </div>
  );
}
