import { useMemo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface StarfieldProps {
  density?: number;
  showMoon?: boolean;
  className?: string;
}

export default function Starfield({ density = 80, showMoon = false, className = '' }: StarfieldProps) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: density }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, [density]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-space-black via-space-900 to-space-800" />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: star.size > 1.5 ? `0 0 ${star.size * 3}px rgba(255,255,255,0.5)` : 'none',
          }}
        />
      ))}

      {/* Moon */}
      {showMoon && (
        <div
          className="absolute rounded-full animate-float"
          style={{
            bottom: '-15%',
            right: '-10%',
            width: '60vw',
            maxWidth: '500px',
            height: '60vw',
            maxHeight: '500px',
            background:
              'radial-gradient(circle at 30% 30%, #4a5568 0%, #2d3748 30%, #1a202c 60%, #0d1117 100%)',
            boxShadow: 'inset -20px -20px 60px rgba(0,0,0,0.8), 0 0 80px rgba(34,211,238,0.1)',
          }}
        >
          {/* Craters */}
          <div className="absolute rounded-full bg-black/30" style={{ top: '20%', left: '25%', width: '12%', height: '12%' }} />
          <div className="absolute rounded-full bg-black/25" style={{ top: '50%', left: '55%', width: '8%', height: '8%' }} />
          <div className="absolute rounded-full bg-black/20" style={{ top: '65%', left: '20%', width: '6%', height: '6%' }} />
          <div className="absolute rounded-full bg-black/30" style={{ top: '15%', left: '60%', width: '5%', height: '5%' }} />
        </div>
      )}

      {/* Cyan glow accents */}
      <div
        className="absolute rounded-full"
        style={{
          top: '-10%',
          left: '-5%',
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          bottom: '-10%',
          left: '30%',
          width: '35vw',
          height: '35vw',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
