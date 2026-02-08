"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  color?: string;
  size?: number;
  speed?: number;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  targetAlpha: number;
}

export default function Particles({
  className,
  quantity = 50,
  color = "#f59e0b",
  size = 1.2,
  speed = 0.3,
  opacity = 0.5,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      setDimensions({ w: rect.width, h: rect.height });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (dimensions.w === 0 || dimensions.h === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);

    // Parse color to rgb
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : "245, 158, 11";
    };
    const rgb = hexToRgb(color);

    // Initialize particles
    particlesRef.current = Array.from({ length: quantity }, () => ({
      x: Math.random() * dimensions.w,
      y: Math.random() * dimensions.h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      alpha: 0,
      targetAlpha: Math.random() * opacity,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = dimensions.w;
        if (p.x > dimensions.w) p.x = 0;
        if (p.y < 0) p.y = dimensions.h;
        if (p.y > dimensions.h) p.y = 0;

        // Fade in
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, quantity, color, size, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0", className)}
    />
  );
}
