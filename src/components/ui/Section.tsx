import type { ReactNode } from "react";

import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  /** Rótulo curto acima do título. Ex.: "Composição". */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Moldura padrão das seções da landing: espaçamento, largura e hierarquia. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: SectionProps) {
  const headingId = `${id}-title`;

  return (
    // `scroll-mt` compensa o cabeçalho fixo: sem isso, o link de âncora leva o
    // topo da seção para debaixo da barra e o título fica cortado.
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-32 px-6 py-24 sm:py-32 ${className}`}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-gold">
                {eyebrow}
              </p>
            ) : null}
            <h2 id={headingId} className="text-3xl leading-tight sm:text-4xl md:text-5xl">
              {title}
            </h2>
            {description ? (
              <div className="mt-6 text-base leading-relaxed text-blue-200 sm:text-lg">
                {description}
              </div>
            ) : null}
          </div>
        </Reveal>

        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}
