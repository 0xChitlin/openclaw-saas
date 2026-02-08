"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-flex animate-gradient-text bg-[length:200%_auto] bg-clip-text text-transparent",
        "bg-gradient-to-r from-amber-400 via-orange-300 to-amber-400",
        className
      )}
    >
      {children}
    </span>
  );
}
