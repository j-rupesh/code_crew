import { useEffect, useRef } from 'react';

interface HyperspeedProps {
  speed?: number;
  starCount?: number;
  starColor?: string;
  bgOpacity?: number;
  active?: boolean;
}

const Hyperspeed = ({ 
  speed = 1, 
  starCount = 200, 
  starColor = 'rgba(255, 255, 255, 0.8)',
  bgOpacity = 0.1,
  active = true
}: HyperspeedProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);

  class Star {
    x: number;
    y: number;
    z: number;
    prevZ: number;

    constructor() {
      this.x = (Math.random() - 0.5) * 2000;
      this.y = (Math.random() - 0.5) * 2000;
      this.z = Math.random() * 1000;
      this.prevZ = this.z;
    }

    update(deltaSpeed: number) {
      this.prevZ = this.z;
      this.z -= deltaSpeed * 10;
      
      if (this.z <= 0) {
        this.x = (Math.random() - 0.5) * 2000;
        this.y = (Math.random() - 0.5) * 2000;
        this.z = 1000;
        this.prevZ = this.z;
      }
    }

    draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const x = (this.x / this.z) * canvas.width + cx;
      const y = (this.y / this.z) * canvas.height + cy;
      const prevX = (this.x / this.prevZ) * canvas.width + cx;
      const prevY = (this.y / this.prevZ) * canvas.height + cy;

      const size = (1 - this.z / 1000) * 3;
      const opacity = 1 - this.z / 1000;

      // Draw motion trail
      ctx.strokeStyle = starColor.replace(/[\d.]+\)$/, `${opacity})`);
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Draw star point with glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      gradient.addColorStop(0, starColor.replace(/[\d.]+\)$/, `${opacity})`));
      gradient.addColorStop(1, starColor.replace(/[\d.]+\)$/, '0)'));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw bright center
      ctx.fillStyle = starColor.replace(/[\d.]+\)$/, `${opacity})`);
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Create stars
    starsRef.current = [];
    for (let i = 0; i < starCount; i++) {
      starsRef.current.push(new Star());
    }

    // Mouse interaction
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let targetSpeed = speed;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Speed up on mouse movement
      const deltaX = Math.abs(e.clientX - canvas.width / 2);
      const deltaY = Math.abs(e.clientY - canvas.height / 2);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2;
      
      targetSpeed = speed + (distance / maxDistance) * 3;
    };

    // Animation loop
    let lastTime = 0;
    let currentSpeed = speed;

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Smooth speed transitions
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      // Clear canvas with fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${bgOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply perspective warp based on mouse position
      ctx.save();
      const warpX = (mouseX - canvas.width / 2) * 0.0001;
      const warpY = (mouseY - canvas.height / 2) * 0.0001;
      ctx.transform(1, warpY, warpX, 1, 0, 0);

      // Update and draw stars
      starsRef.current.forEach(star => {
        star.update(currentSpeed);
        star.draw(ctx, canvas);
      });

      ctx.restore();

      // Add center glow effect
      const centerGradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height / 2, 
        0, 
        canvas.width / 2, 
        canvas.height / 2, 
        Math.min(canvas.width, canvas.height) / 3
      );
      centerGradient.addColorStop(0, 'rgba(100, 126, 234, 0.1)');
      centerGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset target speed gradually
      targetSpeed = targetSpeed * 0.98 + speed * 0.02;

      animationRef.current = requestAnimationFrame(animate);
    };

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    // Start animation
    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, starCount, starColor, bgOpacity, active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
        zIndex: 0 
      }}
    />
  );
};

export default Hyperspeed;