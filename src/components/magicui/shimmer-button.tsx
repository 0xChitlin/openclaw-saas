"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  onClick?: () => void;
  href?: string;
}

const ShimmerButton = ({
  children,
  className,
  shimmerColor = "rgba(255, 255, 255, 0.2)",
  shimmerSize = "0.1em",
  borderRadius = "0.75rem",
  shimmerDuration = "2s",
  background = "linear-gradient(135deg, #f59e0b, #d97706)",
  onClick,
  href,
}: ShimmerButtonProps) => {
  const style: CSSProperties = {
    "--shimmer-color": shimmerColor,
    "--shimmer-size": shimmerSize,
    "--border-radius": borderRadius,
    "--shimmer-duration": shimmerDuration,
    "--background": background,
    borderRadius,
  } as CSSProperties;

  const inner = (
    <span
      className={cn(
        "shimmer-button relative z-10 inline-flex items-center justify-center gap-2 px-8 py-3.5 text-lg font-semibold text-white transition-all",
        "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      style={style}
      onClick={onClick}
    >
      {/* Shimmer sweep */}
      <span className="shimmer-sweep absolute inset-0 overflow-hidden rounded-[inherit]">
        <span className="shimmer-sweep-inner absolute inset-0 animate-shimmer-sweep" />
      </span>
      {/* Background */}
      <span
        className="absolute inset-0 rounded-[inherit]"
        style={{ background: "var(--background)" }}
      />
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </span>
  );

  if (href) {
    return <a href={href}>{inner}</a>;
  }

  return <button type="button">{inner}</button>;
};

export default ShimmerButton;
