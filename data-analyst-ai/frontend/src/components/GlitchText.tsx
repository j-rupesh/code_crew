import { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
  blinking?: boolean;
}

const GlitchText = ({ text, className = '', glitchIntensity = 'medium', blinking = false }: GlitchTextProps) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (blinking) {
      // Continuous blinking effect
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }, 300);

      return () => clearInterval(interval);
    } else {
      // Random glitch effect
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 100);
      }, 800 + Math.random() * 400);

      return () => clearInterval(interval);
    }
  }, [blinking]);

  return (
    <span 
      className={`glitch-text ${isGlitching ? `glitch-active glitch-${glitchIntensity}` : ''} ${blinking ? 'glitch-blinking' : ''} ${className}`}
      data-text={text}
    >
      {text}
    </span>
  );
};

export default GlitchText;