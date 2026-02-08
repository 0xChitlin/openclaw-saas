"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  className?: string;
  delay?: number;
  decimalPlaces?: number;
  suffix?: string;
  prefix?: string;
}

export default function NumberTicker({
  value,
  className,
  delay = 0,
  decimalPlaces = 0,
  suffix = "",
  prefix = "",
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hasStarted, setHasStarted] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setHasStarted(true), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  const spring = useSpring(0, {
    bounce: 0,
    duration: 2000,
  });

  const updateDisplay = useCallback(() => {
    const formatted = Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(spring.get());
    setDisplayValue(formatted);
  }, [spring, decimalPlaces]);

  useEffect(() => {
    if (hasStarted) {
      spring.set(value);
    }
  }, [hasStarted, value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", () => {
      updateDisplay();
    });
    return unsubscribe;
  }, [spring, updateDisplay]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
