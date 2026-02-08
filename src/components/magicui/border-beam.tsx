"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export default function BorderBeam({
  className,
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = "#f59e0b",
  colorTo = "#d97706",
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className
      )}
      style={
        {
          "--border-beam-size": `${size}px`,
          "--border-beam-duration": `${duration}s`,
          "--border-beam-delay": `${delay}s`,
          "--border-beam-color-from": colorFrom,
          "--border-beam-color-to": colorTo,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 rounded-[inherit] border-beam-mask">
        <div className="absolute inset-[-1px] rounded-[inherit] animate-border-beam bg-[length:var(--border-beam-size)_var(--border-beam-size)] bg-[conic-gradient(from_0deg,transparent_0_340deg,var(--border-beam-color-from)_360deg)] bg-no-repeat" />
      </div>
    </div>
  );
}
