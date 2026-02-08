"use client";

import { cn } from "@/lib/utils";

interface DotPatternProps {
  className?: string;
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  color?: string;
}

export default function DotPattern({
  className,
  width = 24,
  height = 24,
  cx = 1,
  cy = 1,
  cr = 1,
  color = "rgba(0,0,0,0.15)",
}: DotPatternProps) {
  const id = `dot-pattern-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/30",
        className
      )}
      aria-hidden
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle cx={cx} cy={cy} r={cr} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
