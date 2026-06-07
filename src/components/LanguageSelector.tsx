import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n, languages } from '../i18n';

interface LanguageSelectorProps {
  variant?: 'full' | 'compact';
}

export function LanguageSelector({ variant = 'compact' }: LanguageSelectorProps) {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = languages.find(l => l.code === language) || languages[0];

  const handleSelect = (code: string) => {
    setLanguage(code);
    setOpen(false);
  };

  if (variant === 'full') {
    return (
      <div ref={ref} className="relative w-full">
        <button
          onClick={() => setOpen(!open)}
          className="w-full px-4 py-3 bg-black/80 border border-red-900/40 text-red-200 rounded text-left flex items-center justify-between transition-colors hover:border-red-700/60"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-900/60" />
            <span>{current.nativeName}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-red-900/60 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-black/95 border border-red-900/40 rounded z-50 shadow-lg">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-red-900/20 transition-colors flex items-center justify-between ${
                  lang.code === language ? 'text-red-400 bg-red-900/10' : 'text-red-200/60'
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-xs text-red-900/40">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors text-xs"
        style={{ color: 'inherit' }}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current.nativeName}</span>
        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 max-h-64 overflow-y-auto bg-black/95 border border-white/10 rounded z-50 shadow-lg">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 transition-colors flex items-center justify-between ${
                lang.code === language ? 'text-white bg-white/5' : 'text-white/50'
              }`}
            >
              <span>{lang.nativeName}</span>
              <span className="text-white/20">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
