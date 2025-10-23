import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

export function MagicAnimation() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 0.5
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="relative">
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
            <Icon name="Wand2" size={48} className="text-white animate-wand-wave" />
          </div>
        </div>
        
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-pink-400 animate-particle"
            style={{
              '--particle-x': `${particle.x}px`,
              '--particle-y': `${particle.y}px`,
              animationDelay: `${particle.delay}s`
            } as React.CSSProperties}
          />
        ))}
        
        <div className="absolute -inset-12 animate-spin-slow">
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <div
              key={angle}
              className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-white animate-twinkle"
              style={{
                transform: `rotate(${angle}deg) translateY(-50px)`,
                animationDelay: `${angle / 60}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
