import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useT } from '../i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const t = useT();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 p-4 rounded-lg border border-amber-600/30 animate-slide-up"
      style={{ background: 'rgba(10,10,5,0.95)', boxShadow: '0 0 30px rgba(200,170,0,0.1)' }}>
      <button onClick={() => setShowPrompt(false)} className="absolute top-2 right-2 text-white/30 hover:text-white/60">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3">
        <Download className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="flex-1">
          <p className="text-amber-500 text-sm font-bold">{t.installTitle}</p>
          <p className="text-white/40 text-xs">{t.installDesc}</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded bg-amber-600/20 border border-amber-600/40 text-amber-500 text-xs font-bold hover:bg-amber-600/30 transition-colors"
        >
          {t.installBtn}
        </button>
      </div>
    </div>
  );
}
