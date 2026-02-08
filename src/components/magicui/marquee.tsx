"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: number;
}

export default function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  speed = 40,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--gap:1.5rem] gap-[var(--gap)]",
        className
      )}
      style={{ "--duration": `${speed}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex shrink-0 gap-[var(--gap)] animate-marquee items-center justify-around",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 gap-[var(--gap)] animate-marquee items-center justify-around",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden
      >
        {children}
      </div>
    </div>
  );
}
