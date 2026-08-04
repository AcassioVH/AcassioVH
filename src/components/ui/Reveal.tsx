"use client";

/**
 * Revelação por rolagem.
 *
 * Envolve `whileInView` do Motion com dois cuidados: respeita
 * `prefers-reduced-motion` (aparece sem deslocamento) e usa `once` para que o
 * conteúdo não pisque ao rolar de volta para cima.
 */

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Atraso em segundos, para escalonar itens de uma lista. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
};

export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: prefersReducedMotion ? 0.2 : 0.7,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Component>
  );
}
