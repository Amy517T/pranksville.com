import { useState, useEffect, useRef } from 'react';

interface ParallaxState {
  rotX: number;
  rotY: number;
  offsetX: number;
  offsetY: number;
}

export function useMouseParallax(strength: number = 8): ParallaxState & { containerRef: React.RefObject<HTMLDivElement> } {
  const [parallax, setParallax] = useState<ParallaxState>({ rotX: 0, rotY: 0, offsetX: 0, offsetY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        setParallax({
          rotY: dx * strength,
          rotX: -dy * strength,
          offsetX: dx * strength * 1.5,
          offsetY: dy * strength * 1.5,
        });
      });
    };

    const handleLeave = () => {
      setParallax({ rotX: 0, rotY: 0, offsetX: 0, offsetY: 0 });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [strength]);

  return { ...parallax, containerRef };
}
