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
      // Native mobile: show real AdMob interstitial, no placeholder needed
      showRealAd();
      return;
    }
    // Browser: show placeholder with countdown
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
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <div className="text-zinc-600 text-sm uppercase tracking-[0.4em] animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-900" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-md">
        <div className="text-zinc-600 text-xs uppercase tracking-[0.4em] animate-pulse">
          Advertisement
        </div>

        <div className="w-full aspect-video rounded-lg border border-zinc-700/40 bg-zinc-800/40 flex flex-col items-center justify-center gap-4 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,#444_0%,transparent_60%)]" />
          <div className="text-zinc-500/40 text-6xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
            PRANKSVILLE
          </div>
          <div className="text-zinc-600/30 text-sm tracking-widest uppercase">
            Your ad could be here
          </div>
          <div className="text-zinc-700/20 text-xs">
            Sponsored content
          </div>
        </div>

        <div className="flex items-center gap-4">
          {canSkip ? (
            <button
              onClick={handleSkip}
              className="px-6 py-2.5 rounded border border-zinc-600/50 bg-zinc-800/60 text-zinc-300 hover:text-white hover:border-zinc-500/70 transition-all duration-300 text-sm tracking-wider uppercase"
            >
              {t.skipAd}
            </button>
          ) : (
            <div className="text-zinc-500/50 text-sm tracking-wider">
              {t.adSkipIn} {countdown}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
