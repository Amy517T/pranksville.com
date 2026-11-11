import { useState, useEffect, useCallback } from 'react';
import { useT } from '../i18n';

interface AdOverlayProps {
  onComplete: () => void;
  skipAfterSeconds?: number;
}

export function AdOverlay({ onComplete, skipAfterSeconds = 5 }: AdOverlayProps) {
  const t = useT();
  const [countdown, setCountdown] = useState(skipAfterSeconds);
  const [canSkip, setCanSkip] = useState(false);
  const [adState, setAdState] = useState<'loading' | 'watching' | 'done'>('loading');

  const showRealAd = useCallback(async () => {
    if (window.afficherPubliciteInterstitielle) {
      try {
        await window.afficherPubliciteInterstitielle();
      } catch {
        // Ad failed — continue anyway
      }
    }
    setAdState('done');
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (window.afficherPubliciteInterstitielle) {
      showRealAd();
      return;
    }
    setAdState('watching');
  }, [showRealAd]);

  useEffect(() => {
    if (adState !== 'watching') return;
    if (countdown <= 0) {
      setCanSkip(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, adState]);

  const handleSkip = useCallback(() => {
    setAdState('done');
    onComplete();
  }, [onComplete]);

  if (adState === 'loading') {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center perspective-1000">
        <div className="text-zinc-600 text-sm uppercase tracking-[0.4em] animate-pulse" style={{ transform: 'translateZ(20px)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center perspective-2000 preserve-3d">
      {/* Deep background layer */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #18181b, #000, #18181b)',
          transform: 'translateZ(-80px) scale(1.1)',
        }}
      />

      {/* Mid-layer glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(60,60,70,0.3) 0%, transparent 60%)',
          transform: 'translateZ(-40px)',
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-md preserve-3d"
        style={{ transform: 'translateZ(20px)' }}
      >
        <div className="text-zinc-600 text-xs uppercase tracking-[0.4em] animate-pulse" style={{ transform: 'translateZ(10px)' }}>
          Advertisement
        </div>

        {/* Ad container with 3D depth */}
        <div
          className="w-full aspect-video rounded-lg border border-zinc-700/40 bg-zinc-800/40 flex flex-col items-center justify-center gap-4 overflow-hidden relative animate-emerge"
          style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,#444_0%,transparent_60%)]" />
          <div
            className="text-zinc-500/40 text-6xl font-bold tracking-wider animate-float-3d"
            style={{ fontFamily: 'Georgia, serif', transform: 'translateZ(30px)' }}
          >
            PRANKSVILLE
          </div>
          <div className="text-zinc-600/30 text-sm tracking-widest uppercase" style={{ transform: 'translateZ(15px)' }}>
            Your ad could be here
          </div>
          <div className="text-zinc-700/20 text-xs" style={{ transform: 'translateZ(10px)' }}>
            Sponsored content
          </div>
        </div>

        <div className="flex items-center gap-4" style={{ transform: 'translateZ(15px)' }}>
          {canSkip ? (
            <button
              onClick={handleSkip}
              className="btn-3d px-6 py-2.5 rounded border border-zinc-600/50 bg-zinc-800/60 text-zinc-300 hover:text-white hover:border-zinc-500/70 transition-all duration-300 text-sm tracking-wider uppercase"
              style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.6)' }}
            >
              {t.skipAd}
            </button>
          ) : (
            <div className="text-zinc-500/50 text-sm tracking-wider animate-pulse">
              {t.adSkipIn} {countdown}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
