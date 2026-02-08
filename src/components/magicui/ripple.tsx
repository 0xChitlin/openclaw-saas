"use client";

import { cn } from "@/lib/utils";

interface RippleProps {
  className?: string;
  color?: string;
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
}

export default function Ripple({
  className,
  color = "rgba(245, 158, 11, 0.12)",
  mainCircleSize = 100,
  mainCircleOpacity = 0.24,
  numCircles = 6,
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden [mask-image:radial-gradient(ellipse_at_center,white,transparent)]",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 120;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        return (
          <div
            key={i}
            className="animate-ripple absolute rounded-full border"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: Math.max(opacity, 0),
              borderColor: color,
              animationDelay,
            }}
          />
        );
      })}
    </div>
  );
}
