"use client";

import { motion, useReducedMotion } from "motion/react";

import { Caustics, LightShafts } from "@/components/experience/Caustics";

/**
 * Hero — a superfície.
 *
 * Ocupa a tela inteira e não pede nada: sem formulário, sem cadastro. A única
 * ação é descer, e a página inteira é essa descida.
 *
 * A composição usa exclusivamente gradiente e transformação. Funciona sem GPU,
 * sem WebGL, sem imagem e sem vídeo — e o primeiro quadro chega junto com o
 * HTML, sem esperar carregamento nenhum.
 */

const SIGLAS = ["CRA", "FIDC", "CRI", "LCA", "COE", "DEB", "FII", "LCI", "CDB", "ETF"];

export function Hero() {
  const still = useReducedMotion();

  const rise = (delay: number) => ({
    initial: still ? { opacity: 0 } : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: still ? 0.3 : 1.1,
      delay: still ? 0 : delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section
      id="inicio"
      data-depth="1"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {/* A coluna d'água: a luz enfraquece conforme desce. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#16404b_0%,#12333b_18%,#0c2530_45%,#081820_72%,#060d10_100%)]"
      />
      <Caustics className="h-[46%]" />
      <LightShafts />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(62%_78%_at_62%_-6%,rgba(227,188,126,.26)_0%,rgba(201,149,74,.08)_42%,transparent_72%)]"
      />
      <div className="beam absolute inset-x-0 top-0 h-[3px]" aria-hidden="true" />
      {/* Vinheta: escurece as bordas e empurra o olho para o centro. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_38%,rgba(4,8,9,.55)_100%)]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 py-28 sm:px-10">
        <motion.p {...rise(0.1)} className="font-mono text-xs uppercase tracking-[0.24em] text-light">
          Acássium Invest · conteúdo educativo
        </motion.p>

        <motion.h1
          {...rise(0.22)}
          id="hero-title"
          className="mt-8 text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.98] tracking-[-0.03em]"
        >
          Visto de cima,
          <br />
          tudo parece igual.
        </motion.h1>

        {/* As siglas como elas chegam: corretas, alinhadas, ilegíveis. */}
        <motion.div
          {...rise(0.38)}
          className="mt-10 flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm tracking-[0.14em] text-aux/70"
          aria-hidden="true"
        >
          {SIGLAS.map((sigla, index) => (
            <span key={sigla} style={{ opacity: 1 - index * 0.075 }}>
              {sigla}
            </span>
          ))}
        </motion.div>

        <motion.p
          {...rise(0.5)}
          className="mt-10 max-w-[54ch] text-lg leading-[1.7] text-body sm:text-xl"
        >
          São nomes exatos que não dizem nada a quem não trabalha com eles. Este site
          desce cada um deles até o que ele é: quem paga você, de onde vem o dinheiro,
          em que prazo e sob quais regras.
        </motion.p>

        <motion.p {...rise(0.6)} className="mt-5 max-w-[54ch] text-lg text-tertiary">
          Sem recomendação, sem ranking, sem promessa de retorno.
        </motion.p>

        <motion.div {...rise(0.72)} className="mt-12 flex flex-wrap items-center gap-6">
          <a
            href="#categorias"
            className="group inline-flex items-center gap-3 bg-light px-7 py-4 text-base font-semibold text-[#060d10] transition-colors duration-300 hover:bg-[#f0d9b4]"
          >
            Ver as categorias
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5">
              ↓
            </span>
          </a>
          <a
            href="#o-que-e"
            className="border-b border-light/40 pb-1 text-base text-light transition-colors duration-300 hover:border-light"
          >
            Como este site funciona
          </a>
        </motion.div>
      </div>

      {/* Indicação de rolagem: uma linha que respira. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-10 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: still ? 0 : 1.4, duration: 0.8 }}
      >
        <span className="relative block h-14 w-px overflow-hidden bg-edge">
          {!still ? (
            <motion.span
              className="absolute inset-x-0 top-0 block h-5 bg-light"
              animate={{ y: [-20, 56] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
        </span>
      </motion.div>
    </section>
  );
}
