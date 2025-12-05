import React from "react";
import { motion, MotionValue } from "framer-motion";

interface GoogleGeminiEffectProps {
  pathLengths: MotionValue<number>[];
}

export const GoogleGeminiEffect: React.FC<GoogleGeminiEffectProps> = ({
  pathLengths,
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {pathLengths.map((pathLength, index) => {
          const y = 30 + index * 10;
          // Path starts at x=0 (left edge) and ends at x=100 (right edge)
          const path = `M 0 ${y} Q 25 ${y - 5 + index * 2} 50 ${y} T 100 ${y}`;
          return (
            <motion.path
              key={index}
              d={path}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="0.3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{
                pathLength: pathLength,
                opacity: pathLength,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};
