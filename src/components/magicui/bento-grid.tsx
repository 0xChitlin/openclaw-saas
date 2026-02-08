"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  name: string;
  description: string;
  icon: ReactNode;
  background?: ReactNode;
}

export function BentoCard({
  children,
  className,
  name,
  description,
  icon,
  background,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6",
        "hover:border-white/20 transition-all duration-500",
        "hover:bg-white/[0.06]",
        className
      )}
    >
      {background && (
        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
          {background}
        </div>
      )}
      <div className="relative z-10">
        <div className="mb-4 text-amber-400">{icon}</div>
        <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
        <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  );
}
