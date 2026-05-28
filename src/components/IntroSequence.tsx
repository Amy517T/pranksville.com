import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface IntroSequenceProps {
  playerName: string;
  onComplete: () => void;
}

const introLines: { text: string; delay: number }[] = [
  { text: 'October 13th, 1987.', delay: 1500 },
  { text: 'You are {name}, investigative journalist for the Camden Courier.', delay: 3000 },
  { text: 'Three weeks ago, Dr. Eleanor Voss walked into Hargrove Manor and never came out.', delay: 3500 },
  { text: 'Police found her car in the driveway. Her notebook on the porch. Her voice on the 911 call — cut short.', delay: 3500 },
  { text: '"Something is wrong with this house. It knows I\'m —"', delay: 2500 },
  { text: 'Two officers entered the manor the next morning. One left. He doesn\'t speak anymore.', delay: 3500 },
  { text: 'The town calls it Pranksville — because the house plays tricks. Harmless pranks, they said.', delay: 3500 },
  { text: 'They stopped saying that after the third disappearance.', delay: 2500 },
  { text: 'Your editor told you to drop it. Your instincts told you to dig deeper.', delay: 3000 },
  { text: 'Tonight, you drove to Hargrove Manor alone.', delay: 2500 },
  { text: 'The iron gate was already open. The front door — unlocked. As if it was expecting you.', delay: 3000 },
  { text: 'You step inside.', delay: 2000 },
  { text: 'The door closes behind you.', delay: 2000 },
  { text: 'It was never a door. It was a mouth.', delay: 2500 },
];

export function IntroSequence({ playerName, onComplete }: IntroSequenceProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [fadeComplete, setFadeComplete] = useState(false);

  useEffect(() => {
    if (currentLine >= introLines.length) {
      setTimeout(() => setFadeComplete(true), 1500);
      setTimeout(() => onComplete(), 3000);
      return;
    }

    const line = introLines[currentLine];
    const text = line.text.replace('{name}', playerName);
    const delay = line.delay;

    const timer = setTimeout(() => {
      setDisplayedLines(prev => [...prev, text]);
      setCurrentLine(prev => prev + 1);
    }, currentLine === 0 ? 800 : delay);

    return () => clearTimeout(timer);
  }, [currentLine, playerName, onComplete]);

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
