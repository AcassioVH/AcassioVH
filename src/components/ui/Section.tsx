import type { ReactNode } from "react";

import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  /** Rótulo técnico. No sistema, ele nomeia o nível de profundidade da seção. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Nota curta alinhada à direita do rótulo. Ex.: uma ressalva de escopo. */
  aside?: ReactNode;
  children: ReactNode;
  /** Profundidade da seção — cada nível é um passo a mais de detalhe. */
  depth?: "base" | "deep" | "surface" | "abyss";
  /** Régua luminosa no topo, usada nas seções de virada. */
  beam?: boolean;
  className?: string;
};

const DEPTH_CLASS = {
  base: "bg-ground",
  deep: "bg-deep",
  surface: "bg-surface",
  abyss: "bg-abyss",
} as const;

/**
 * Moldura padrão de seção.
 *
 * `depth` não é decoração: a escala de profundidade da marca indica nível de
 * detalhe, nunca valor ou desempenho. Uma seção mais funda é mais específica,
 * e é por isso que as páginas descem de `base` para `abyss` conforme saem do
 * geral para o documento.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  aside,
  children,
  depth = "base",
  beam = false,
  className = "",
}: SectionProps) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`relative scroll-mt-24 border-t border-edge-soft px-6 py-20 sm:px-10 sm:py-24 ${DEPTH_CLASS[depth]} ${className}`}
    >
      {beam ? <div aria-hidden="true" className="beam absolute inset-x-0 top-0 h-px" /> : null}

      <div className="mx-auto max-w-6xl">
        <Reveal>
          {eyebrow || aside ? (
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
              {eyebrow ? <p className="tech text-amber">{eyebrow}</p> : <span />}
              {aside ? <p className="text-sm text-tertiary">{aside}</p> : null}
            </div>
          ) : null}

          <h2 id={headingId} className="max-w-3xl text-3xl leading-[1.08] sm:text-4xl md:text-5xl">
            {title}
          </h2>

          {description ? (
            <div className="mt-6 max-w-2xl text-lg leading-relaxed text-aux">{description}</div>
          ) : null}
        </Reveal>

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
