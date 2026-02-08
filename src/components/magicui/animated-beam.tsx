"use client";

import { cn } from "@/lib/utils";

interface AnimatedBeamProps {
  className?: string;
  fromRef?: React.RefObject<HTMLElement | null>;
  toRef?: React.RefObject<HTMLElement | null>;
}

export default function AnimatedBeam({ className }: AnimatedBeamProps) {
  return (
    <div
      className={cn(
        "absolute h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-beam-pulse",
        className
      )}
    />
  );
}
