import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LanguageCode, Translations } from './types';
import { en } from './en';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
});

const translationCache: Record<string, Translations> = { en };

const exportNameMap: Record<string, string> = {
  'zh-TW': 'zhTW',
  'pt-BR': 'ptBR',
};

async function loadTranslation(code: LanguageCode): Promise<Translations> {
  if (translationCache[code]) return translationCache[code];
  try {
    const mod = await import(`./translations/${code}.ts`);
    const exportName = exportNameMap[code] || code;
    const translation = mod[exportName] as Translations;
    if (translation) {
      translationCache[code] = translation;
      return translation;
    }
    return en;
  } catch {
    return en;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('pranksville-language');
    return saved || 'en';
  });
  const [t, setT] = useState<Translations>(en);

  const setLanguage = useCallback(async (code: LanguageCode) => {
    const translations = await loadTranslation(code);
    setLanguageState(code);
    setT(translations);
    localStorage.setItem('pranksville-language', code);
    document.documentElement.lang = code;
    document.documentElement.dir = ['ar', 'he', 'fa'].includes(code) ? 'rtl' : 'ltr';
  }, []);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useContext(I18nContext).t;
}
