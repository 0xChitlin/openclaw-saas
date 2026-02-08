"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface ShineBorderProps {
  children: ReactNode;
  className?: string;
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
}

export default function ShineBorder({
  children,
  className,
  borderRadius = 16,
  borderWidth = 2,
  duration = 8,
  color = ["#f59e0b", "#fbbf24", "#f59e0b"],
}: ShineBorderProps) {
  const colorStr = Array.isArray(color) ? color.join(", ") : color;

  return (
    <div
      className={cn("relative overflow-hidden p-[2px]", className)}
      style={
        {
          borderRadius: `${borderRadius}px`,
          "--shine-border-width": `${borderWidth}px`,
          "--shine-border-radius": `${borderRadius}px`,
        } as CSSProperties
      }
    >
      {/* Animated border gradient */}
      <div
        className="pointer-events-none absolute inset-0 animate-shine-border"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, ${colorStr}, transparent 80%)`,
          borderRadius: "inherit",
          animationDuration: `${duration}s`,
        }}
      />
      {/* Content with background */}
      <div
        className="relative z-10 bg-white"
        style={{ borderRadius: `${borderRadius - borderWidth}px` }}
      >
        {children}
      </div>
    </div>
  );
}
