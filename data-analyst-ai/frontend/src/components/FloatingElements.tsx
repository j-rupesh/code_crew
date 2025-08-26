import { useState, useEffect } from 'react';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';

const FloatingElements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="floating-elements">
      {/* Floating Action Buttons */}
      <div className="floating-fab fab-1">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="floating-fab fab-2">
        <Zap className="w-4 h-4" />
      </div>
      <div className="floating-fab fab-3">
        <TrendingUp className="w-4 h-4" />
      </div>

      {/* Interactive Sparkles */}
      <div 
        className="interactive-sparkle sparkle-1"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      />
      <div 
        className="interactive-sparkle sparkle-2"
        style={{
          transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
        }}
      />
      <div 
        className="interactive-sparkle sparkle-3"
        style={{
          transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * -0.015}px)`,
        }}
      />
    </div>
  );
};

export default FloatingElements;