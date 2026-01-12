import React, { useEffect, useRef, useCallback } from 'react';
import styles from './Confetti.module.css';

/** Particle shape types */
export type ParticleShape = 'square' | 'circle' | 'diamond' | 'paw';

/** Particle configuration for confetti animation */
export interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  shape: ParticleShape;
  opacity: number;
}

export interface ConfettiProps {
  /** Whether confetti animation is active */
  active: boolean;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Number of particles */
  particleCount?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Colors for confetti particles */
  colors?: string[];
}

/** Default confetti colors matching the game's color palette */
const DEFAULT_COLORS = [
  '#d4a574', // gold
  '#e8c9a0', // light gold
  '#c17f59', // accent orange
  '#7eb87e', // success green
  '#f5f0e8', // text white
  '#ffd700', // gold
  '#ff69b4', // pink
  '#87ceeb', // sky blue
];

/** Shape distribution weights */
const SHAPE_WEIGHTS: { shape: ParticleShape; weight: number }[] = [
  { shape: 'square', weight: 0.3 },
  { shape: 'circle', weight: 0.3 },
  { shape: 'diamond', weight: 0.25 },
  { shape: 'paw', weight: 0.15 },
];

/**
 * Select a random shape based on weights
 */
function selectRandomShape(): ParticleShape {
  const random = Math.random();
  let cumulative = 0;
  for (const { shape, weight } of SHAPE_WEIGHTS) {
    cumulative += weight;
    if (random <= cumulative) {
      return shape;
    }
  }
  return 'square';
}

/**
 * Create a new particle with random properties
 */
function createParticle(canvasWidth: number, colors: string[]): Particle {
  return {
    x: Math.random() * canvasWidth,
    y: -20 - Math.random() * 100, // Start above the screen
    size: Math.random() * 10 + 5, // 5-15px
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 3 + 2, // 2-5 fall speed
    speedX: (Math.random() - 0.5) * 4, // -2 to 2 horizontal sway
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10, // -5 to 5 rotation per frame
    shape: selectRandomShape(),
    opacity: 1,
  };
}

/**
 * Draw a particle on the canvas
 */
function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle
): void {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate((particle.rotation * Math.PI) / 180);
  ctx.globalAlpha = particle.opacity;

  if (particle.shape === 'paw') {
    // Draw paw print emoji
    ctx.font = `${particle.size * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uD83D\uDC3E', 0, 0);
  } else {
    ctx.fillStyle = particle.color;
    const halfSize = particle.size / 2;

    switch (particle.shape) {
      case 'square':
        ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -halfSize);
        ctx.lineTo(halfSize, 0);
        ctx.lineTo(0, halfSize);
        ctx.lineTo(-halfSize, 0);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }

  ctx.restore();
}

/**
 * Update particle position and properties
 */
function updateParticle(
  particle: Particle,
  canvasHeight: number,
  elapsed: number,
  duration: number
): void {
  // Apply gravity and sway
  particle.y += particle.speedY;
  particle.x += particle.speedX;
  particle.rotation += particle.rotationSpeed;

  // Add subtle horizontal oscillation
  particle.x += Math.sin(elapsed / 200 + particle.rotation) * 0.5;

  // Fade out near the bottom or near the end of duration
  const bottomFade = canvasHeight - 100;
  if (particle.y > bottomFade) {
    const fadeProgress = (particle.y - bottomFade) / 100;
    particle.opacity = Math.max(0, 1 - fadeProgress);
  }

  // Also fade out near the end of the animation
  const fadeStartTime = duration * 0.7;
  if (elapsed > fadeStartTime) {
    const timeProgress = (elapsed - fadeStartTime) / (duration * 0.3);
    particle.opacity = Math.min(particle.opacity, 1 - timeProgress);
  }
}

/**
 * Confetti component for celebration effects.
 * Uses Canvas for efficient particle rendering with requestAnimationFrame.
 *
 * Features:
 * - Multiple particle shapes (square, circle, diamond, paw emoji)
 * - Physics simulation (gravity, rotation, horizontal sway)
 * - Fade out at bottom and end of animation
 * - Automatic cleanup after duration
 */
export const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 5000,
  particleCount = 150,
  onComplete,
  colors = DEFAULT_COLORS,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    if (!active) {
      // Cleanup when deactivated
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create initial particles
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas.width, colors)
    );

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;

      if (elapsed >= duration) {
        // Animation complete
        if (animationIdRef.current !== null) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        particlesRef.current = [];
        onComplete?.();
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        updateParticle(particle, canvas.height, elapsed, duration);
        drawParticle(ctx, particle);

        // Reset particles that fall off screen
        if (particle.y > canvas.height + 20 || particle.opacity <= 0) {
          Object.assign(particle, createParticle(canvas.width, colors));
          particle.opacity = 1;
        }
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationIdRef.current = requestAnimationFrame(animate);

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [active, duration, particleCount, colors, onComplete, handleResize]);

  if (!active) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      data-testid="confetti-canvas"
      aria-hidden="true"
    />
  );
};
