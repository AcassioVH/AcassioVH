"use client";

import { useEffect, useState } from "react";

/**
 * Medidor de profundidade — a régua fixa na lateral.
 *
 * Transforma a rolagem em descida: cada seção declara seu nível com
 * `data-depth`, e a marca correspondente acende quando a seção domina a tela.
 *
 * **Só marcas, sem rótulo.** A primeira versão trazia o nome de cada nível ao
 * lado, e os nomes invadiam a primeira coluna do conteúdo em telas largas. A
 * correção não foi encolher a fonte: foi perceber que o rótulo já existe no
 * olho de cada seção ("Coluna d'água · a pergunta que separa tudo"), e repetí-lo
 * na régua era redundância que custava espaço. A régua indica posição; a seção
 * diz o nome.
 *
 * Usa `IntersectionObserver` em vez de escutar `scroll`: o navegador avisa
 * quando algo entra na faixa central da tela, sem rodar código a cada quadro.
 */

const LEVELS = [
  { depth: 1, label: "Superfície" },
  { depth: 2, label: "Coluna d'água" },
  { depth: 3, label: "Zona iluminada" },
  { depth: 4, label: "Fundo" },
  { depth: 5, label: "Abismo" },
] as const;

export function DepthGauge() {
  const [active, setActive] = useState(1);

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
        if (Number.isFinite(depth)) setActive(depth);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
        Nível atual: {current?.label}
      </p>

      <ol className="flex flex-col items-start gap-4">
        {LEVELS.map((level) => {
          const isActive = level.depth === active;
          const isPassed = level.depth < active;

          return (
            <li key={level.depth} aria-hidden="true">
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
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
