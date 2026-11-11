import { useMemo } from 'react';

interface Particles3DProps {
  count?: number;
  color?: string;
  sizeRange?: [number, number];
  speed?: number;
  zIndex?: number;
}

interface Particle {
  left: number;
  top: number;
  size: number;
  dx: number;
  dy: number;
  dz: number;
  delay: number;
  duration: number;
  opacity: number;
  blur: number;
}

export function Particles3D({
  count = 40,
  color = '#e94560',
  sizeRange = [2, 6],
  speed = 1,
  zIndex = 1,
}: Particles3DProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, () => {
      const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
      return {
        left: Math.random() * 100,
        top: 70 + Math.random() * 40,
        size,
        dx: (Math.random() - 0.5) * 60,
        dy: -(80 + Math.random() * 200),
        dz: 20 + Math.random() * 80,
        delay: Math.random() * 10,
        duration: (8 + Math.random() * 12) / speed,
        opacity: 0.2 + Math.random() * 0.5,
        blur: Math.random() * 2,
      };
    });
  }, [count, sizeRange, speed]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none preserve-3d"
      style={{ zIndex, perspective: '800px' }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color,
            opacity: 0,
            filter: `blur(${p.blur}px)`,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '--dz': `${p.dz}px`,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
