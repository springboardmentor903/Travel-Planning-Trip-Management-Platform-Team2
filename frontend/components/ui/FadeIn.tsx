"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function FadeIn({ children, delay = 0, className, direction = "up" }: FadeInProps) {
  const shouldReduce = useReducedMotion();
  const offsets = { up: { y: 16 }, down: { y: -16 }, left: { x: 16 }, right: { x: -16 }, none: {} };
  const initial = shouldReduce ? { opacity: 0 } : { opacity: 0, ...offsets[direction] };
  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
