import { useEffect, useState, useRef, useCallback } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const trailRef = useRef<Array<{ x: number; y: number; id: number }>>([]);
  const idRef = useRef(0);
  const animationRef = useRef<number>();

  const updateTrail = useCallback(() => {
    setTrail([...trailRef.current]);
  }, []);

  useEffect(() => {
    let lastUpdate = 0;
    
    const updatePosition = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < 16) return; // Throttle to ~60fps
      lastUpdate = now;
      
      const newPos = { x: e.clientX, y: e.clientY };
      setPosition(newPos);
      
      // Add to trail less frequently for better performance
      if (now - lastUpdate > 32) { // ~30fps for trail
        const newTrailPoint = { ...newPos, id: idRef.current++ };
        trailRef.current = [...trailRef.current, newTrailPoint].slice(-8);
        
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(updateTrail);
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Add event listeners
    document.addEventListener('mousemove', updatePosition, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, [role="button"], .card-premium');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [updateTrail]);

  return (
    <>
      {/* Cursor Trail */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="cursor-trail"
          style={{
            left: `${point.x - 4}px`,
            top: `${point.y - 4}px`,
            opacity: (index + 1) / trail.length * 0.6,
            transform: `scale(${(index + 1) / trail.length * 0.8})`,
          }}
        />
      ))}
      
      {/* Main Cursor */}
      <div
        className={`custom-cursor ${isHovering ? 'cursor-hover' : ''} ${isClicking ? 'cursor-click' : ''}`}
        style={{
          left: `${position.x - 12}px`,
          top: `${position.y - 12}px`,
        }}
      >
        <div className="cursor-inner" />
        <div className="cursor-glow" />
      </div>

      {/* Magnetic Effect Dots */}
      <div
        className="cursor-magnetic"
        style={{
          left: `${position.x - 2}px`,
          top: `${position.y - 2}px`,
        }}
      />
    </>
  );
};

export default CustomCursor;