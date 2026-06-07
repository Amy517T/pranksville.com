import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useT } from '../i18n';

interface IntroSequenceProps {
  playerName: string;
  onComplete: () => void;
}

export function IntroSequence({ playerName, onComplete }: IntroSequenceProps) {
  const t = useT();
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [fadeComplete, setFadeComplete] = useState(false);

  const introLines: { text: string; delay: number }[] = [
    { text: t.intro_1, delay: 1500 },
    { text: t.intro_2.replace('{name}', playerName), delay: 3000 },
    { text: t.intro_3, delay: 3500 },
    { text: t.intro_4, delay: 3500 },
    { text: t.intro_5, delay: 2500 },
    { text: t.intro_6, delay: 3500 },
    { text: t.intro_7, delay: 3500 },
    { text: t.intro_8, delay: 2500 },
    { text: t.intro_9, delay: 3000 },
    { text: t.intro_10, delay: 2500 },
    { text: t.intro_11, delay: 3000 },
    { text: t.intro_12, delay: 2000 },
    { text: t.intro_13, delay: 2000 },
    { text: t.intro_14, delay: 2500 },
  ];

  useEffect(() => {
    if (currentLine >= introLines.length) {
      setTimeout(() => setFadeComplete(true), 1500);
      setTimeout(() => onComplete(), 3000);
      return;
    }

    const line = introLines[currentLine];
    const delay = line.delay;

    const timer = setTimeout(() => {
      setDisplayedLines(prev => [...prev, line.text]);
      setCurrentLine(prev => prev + 1);
    }, currentLine === 0 ? 800 : delay);

    return () => clearTimeout(timer);
  }, [currentLine]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${fadeComplete ? 'opacity-0' : 'opacity-100'}`}
      onClick={() => {
        if (currentLine >= introLines.length) {
          onComplete();
        }
      }}
    >
      <div className="max-w-xl w-full px-8 space-y-4">
        {displayedLines.map((line, i) => (
          <p
            key={i}
            className="text-base md:text-lg leading-relaxed transition-all duration-700"
            style={{
              color: i === displayedLines.length - 1 ? '#cc6666' : i < 3 ? '#666' : '#999',
              fontFamily: 'Georgia, serif',
              textShadow: i === displayedLines.length - 1 ? '0 0 15px rgba(200,0,0,0.3)' : 'none',
              opacity: i === displayedLines.length - 1 ? 1 : 0.6,
            }}
          >
            {line}
          </p>
        ))}

        {currentLine < introLines.length && (
          <div className="pt-4 flex items-center gap-2 text-white/20 text-xs animate-pulse">
            <ChevronRight className="w-3 h-3" />
            <span>Click to skip</span>
          </div>
        )}
      </div>
    </div>
  );
}
