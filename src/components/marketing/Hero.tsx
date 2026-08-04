"use client";

import { motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { Disclaimer } from "@/components/ui/Disclaimer";
import { SCOPE_STATEMENT } from "@/domain/compliance/policy";

/**
 * A cena 3D só existe no cliente e fica fora do bundle inicial: ela pesa mais
 * que todo o resto da landing somado, e o texto do hero precisa aparecer
 * imediatamente, sem esperar por Three.js.
 */
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const rise = (delay: number) => ({
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: prefersReducedMotion ? 0.25 : 0.9,
      delay: prefersReducedMotion ? 0 : delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pb-24 pt-32"
    >
      {/* Fundo: gradiente estático que também serve de fallback quando não há WebGL. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_35%,#16345c_0%,#0b1f3a_58%,#08192e_100%)]"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <HeroScene />
      </div>

      {/* Véu que escurece a cena atrás do texto, preservando contraste de leitura. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy via-navy/75 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.p
          {...rise(0.05)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
          Leitura descritiva de carteira
        </motion.p>

        <motion.h1
          {...rise(0.15)}
          id="hero-title"
          className="max-w-4xl text-4xl leading-[1.08] sm:text-6xl md:text-7xl"
        >
          A sua carteira,
          <br />
          <span className="text-gradient-gold">explicada.</span>
        </motion.h1>

        <motion.p
          {...rise(0.28)}
          className="mt-8 max-w-xl text-lg leading-relaxed text-blue-200 sm:text-xl"
        >
          Você informa os ativos que já tem. Nós organizamos por classe, emissor e
          instituição, e explicamos como cada tipo funciona — liquidez, tributação e
          garantia.
        </motion.p>

        <motion.p {...rise(0.36)} className="mt-4 max-w-xl font-serif text-lg text-gold-200">
          {SCOPE_STATEMENT}
        </motion.p>

        <motion.div {...rise(0.46)} className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/criar-conta"
            className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy transition-colors duration-300 hover:bg-gold-200"
          >
            Organizar minha carteira
          </Link>
          <a
            href="#composicao"
            className="rounded-full border border-blue-200/30 px-7 py-3.5 text-sm font-medium text-mist transition-colors duration-300 hover:border-gold/60 hover:text-gold"
          >
            Ver como funciona
          </a>
        </motion.div>

        <motion.div {...rise(0.6)} className="mt-14 max-w-lg">
          <Disclaimer />
        </motion.div>
      </div>
    </section>
  );
}
