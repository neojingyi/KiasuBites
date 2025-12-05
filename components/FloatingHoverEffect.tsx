import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';

interface FloatingHoverEffectProps {
  baseImageUrl: string;
  overlayImageUrl: string;
  revealRadius?: number;
  containerHeight?: string;
  className?: string;
}

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

export const FloatingHoverEffect: React.FC<FloatingHoverEffectProps> = ({
  baseImageUrl,
  overlayImageUrl,
  revealRadius = 120,
  containerHeight = '600px',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const trailRef = useRef<TrailPoint[]>([]);
  const animationFrameRef = useRef<number>();
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);

  // Motion values for smooth cursor following
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring animations for smooth following
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Update trail
  const updateTrail = () => {
    if (!isHovering) return;

    const now = Date.now();
    const trailAge = 500; // Keep trail points for 500ms
    const minDistance = 10; // Minimum distance between trail points

    // Add current position to trail (only if far enough from last point)
    const currentX = smoothX.get();
    const currentY = smoothY.get();
    
    if (trailRef.current.length === 0) {
      trailRef.current.push({ x: currentX, y: currentY, timestamp: now });
    } else {
      const lastPoint = trailRef.current[trailRef.current.length - 1];
      const distance = Math.sqrt(
        Math.pow(currentX - lastPoint.x, 2) + Math.pow(currentY - lastPoint.y, 2)
      );
      
      if (distance > minDistance) {
        trailRef.current.push({ x: currentX, y: currentY, timestamp: now });
      } else {
        // Update last point position
        lastPoint.x = currentX;
        lastPoint.y = currentY;
        lastPoint.timestamp = now;
      }
    }

    // Remove old trail points
    trailRef.current = trailRef.current.filter(
      (point) => now - point.timestamp < trailAge
    );

    // Limit trail length for performance
    if (trailRef.current.length > 20) {
      trailRef.current = trailRef.current.slice(-20);
    }

    // Update state to trigger re-render
    setTrailPoints([...trailRef.current]);
  };

  // Animate trail updates
  useEffect(() => {
    if (isHovering && !isTouch) {
      const animate = () => {
        updateTrail();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      setTrailPoints([]);
    }
  }, [isHovering, isTouch]);

  // Detect touch devices
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorX.set(x);
    cursorY.set(y);
  };

  const handleMouseEnter = () => {
    if (!isTouch) {
      setIsHovering(true);
      trailRef.current = [];
    }
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setIsHovering(false);
      trailRef.current = [];
      setTrailPoints([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ 
        height: containerHeight,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Image (Macarons) - Smaller, positioned near top */}
      <div className="absolute inset-0 w-full h-full flex items-start justify-center pt-8 md:pt-12">
        <img
          src={baseImageUrl}
          alt="Base"
          className="w-[30%] md:w-[25%] max-h-[50%] object-contain"
          draggable={false}
        />
      </div>

      {/* Overlay Image (Bag Logo) - Smaller, positioned near top */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 flex items-start justify-center pt-8 md:pt-12"
      >
        <motion.img
          src={overlayImageUrl}
          alt="Overlay"
          className="w-[60%] md:w-[50%] max-h-[70%] object-contain relative z-10"
          draggable={false}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Trail Reveal Masks - Show base image through overlay */}
      {trailPoints.map((point, index) => {
        const now = Date.now();
        const age = (now - point.timestamp) / 500;
        const opacity = Math.max(0, 1 - age);
        const size = revealRadius * (0.4 + opacity * 0.6);
        
        // Calculate the offset to show the base image in the correct position
        // The base image is centered horizontally and positioned near top
        const containerWidth = containerRef.current?.offsetWidth || 0;
        const baseImageX = containerWidth / 2;
        const baseImageY = 60; // Approximate top offset (pt-8 md:pt-12)
        const offsetX = baseImageX - point.x;
        const offsetY = baseImageY - point.y;
        
        return (
          <div
            key={`trail-${point.timestamp}-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: point.x,
              top: point.y,
              width: size * 2,
              height: size * 2,
              transform: 'translate(-50%, -50%)',
              clipPath: `circle(${size}px at center)`,
              opacity: opacity,
              zIndex: 20,
              overflow: 'hidden',
            }}
          >
            <img
              src={baseImageUrl}
              alt="Reveal"
              className="w-[30%] md:w-[25%] max-h-[50%] object-contain"
              style={{
                position: 'absolute',
                left: `calc(50% + ${offsetX}px)`,
                top: `calc(50% + ${offsetY}px)`,
                transform: 'translate(-50%, -50%)',
                filter: 'brightness(1.05)',
                width: '30%',
                maxHeight: '50%',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

