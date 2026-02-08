"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: string;
  inView?: boolean;
}

const BlurFade = ({
  children,
  className,
  delay = 0,
  duration = 0.4,
  yOffset = 6,
  blur = "6px",
  inView = true,
}: BlurFadeProps) => {
  const variants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
  };

  return (
    <motion.div
      initial="hidden"
      animate={inView ? undefined : undefined}
      whileInView={inView ? "visible" : undefined}
      viewport={{ once: true }}
      transition={{ delay, duration, ease: "easeOut" }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default BlurFade;
