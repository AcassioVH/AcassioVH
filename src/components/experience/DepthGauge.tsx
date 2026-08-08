"use client";

/**
 * Medidor de profundidade — a régua fixa na lateral.
 *
 * Transforma a rolagem em descida: cada seção declara seu nível com
 * `data-depth`, e a marca correspondente acende quando a seção domina a tela.
 *
 * **O rótulo voltou, e desta vez sem atrapalhar.** A primeira versão trazia o
 * nome de cada nível fixo ao lado das marcas, e os nomes invadiam a primeira
 * coluna do conteúdo em telas largas — foram removidos. A remoção resolveu o
 * atropelo e custou a leitura: sem nome, a régua vira enfeite, e a escala de
 * profundidade deixa de ensinar o que ela significa.
 *
 * A solução não é escolher entre as duas coisas, é separá-las no tempo. O nome
 * aparece só no instante em que o nível muda, ao lado da marca que acendeu, e se
 * apaga sozinho. Enquanto a pessoa lê parada, a régua é só marca; enquanto ela
 * desce, a régua diz onde ela está.
 *
 * A escala mede **nível de detalhe, nunca valor, risco ou desempenho**. Descer
 * é ficar mais específico — e o nível 5 é onde a marca declara o próprio limite.
 *
 * Usa `IntersectionObserver` em vez de escutar `scroll`: o navegador avisa
 * quando algo entra na faixa central da tela, sem rodar código a cada quadro.
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const LEVELS = [
  { depth: 1, label: "Superfície", nota: "o nome do produto" },
  { depth: 2, label: "Coluna d'água", nota: "para onde vai o dinheiro" },
  { depth: 3, label: "Zona iluminada", nota: "a estrutura" },
  { depth: 4, label: "Fundo", nota: "os documentos" },
  { depth: 5, label: "Abismo", nota: "fora do nosso escopo" },
] as const;

export function DepthGauge() {
  const [active, setActive] = useState(1);
  const [anunciando, setAnunciando] = useState(false);
  const parado = useReducedMotion();
  /**
   * O nível anterior mora numa ref, e não no estado.
   *
   * A primeira versão comparava dentro do atualizador de `setActive` e chamava
   * `setAnunciando` ali — atualizador de estado precisa ser puro, e o React pode
   * executá-lo duas vezes em desenvolvimento. O rótulo piscaria duas vezes, ou
   * nenhuma. A ref guarda a comparação fora do ciclo de renderização.
   */
  const nivelAnterior = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // A seção que ocupa a faixa central manda no medidor. Sem esse recorte,
        // duas seções visíveis ao mesmo tempo brigariam pelo estado.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const depth = Number((visible.target as HTMLElement).dataset.depth);
        if (!Number.isFinite(depth)) return;

        // O rótulo só aparece quando o nível de fato muda, e nunca na primeira
        // leitura — abrir a página já com um aviso na lateral seria ruído.
        const anterior = nivelAnterior.current;
        nivelAnterior.current = depth;
        setActive(depth);

        if (anterior !== null && depth !== anterior) {
          setAnunciando(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setAnunciando(false), 2200);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const current = LEVELS.find((level) => level.depth === active);

  return (
    <aside
      className="pointer-events-none fixed left-7 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
      aria-label="Profundidade da página"
    >
      {/* O estado é anunciado por texto para leitor de tela, já que as marcas
          sozinhas não significam nada fora do visual. */}
      <p className="sr-only" aria-live="polite">
        Nível {active} de 5: {current?.label} — {current?.nota}
      </p>

      <ol className="flex flex-col items-start gap-4">
        {LEVELS.map((level) => {
          const isActive = level.depth === active;
          const isPassed = level.depth < active;

          return (
            <li key={level.depth} aria-hidden="true" className="relative flex items-center">
              <span
                className="block h-px transition-all duration-700 ease-out"
                style={{
                  width: isActive ? 30 : isPassed ? 16 : 9,
                  background: isActive
                    ? "var(--color-light)"
                    : isPassed
                      ? "var(--color-amber)"
                      : "var(--color-edge)",
                  opacity: isActive ? 1 : isPassed ? 0.55 : 0.45,
                  boxShadow: isActive ? "0 0 12px 0 rgba(227,188,126,.5)" : "none",
                }}
              />

              <AnimatePresence>
                {isActive && anunciando ? (
                  <motion.span
                    className="absolute left-10 whitespace-nowrap"
                    initial={parado ? { opacity: 0 } : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: parado ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-light">
                      {level.label}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] tracking-[0.06em] text-muted">
                      {level.nota}
                    </span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
