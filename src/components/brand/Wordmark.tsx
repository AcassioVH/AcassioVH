/**
 * A marca: o "A" reduzido às duas hastes.
 *
 * A haste maior é o ativo; a menor, apoiada nela, é a explicação. A travessa
 * que fecharia a letra — e daria a conclusão — está ausente por decisão: a
 * marca sustenta, não conclui.
 *
 * É a mesma tese do produto dita em forma, e por isso o símbolo não deve ser
 * "corrigido" com uma barra transversal em nenhuma variação futura.
 */

type MarkProps = {
  /** Altura da haste maior, em pixels. */
  size?: number;
  /** Cor da haste maior. A menor é sempre âmbar, salvo em negativo. */
  tall?: string;
  short?: string;
  className?: string;
};

export function Mark({
  size = 24,
  tall = "var(--color-title)",
  short = "var(--color-amber)",
  className = "",
}: MarkProps) {
  // Proporções tiradas do guia: haste menor a 2/3 da maior, largura ~21%.
  const width = Math.round(size * 0.92);
  const stroke = Math.max(2, Math.round(size * 0.21));
  const shortHeight = Math.round(size * 0.67);

  return (
    <span
      aria-hidden="true"
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width, height: size }}
    >
      <span
        className="absolute bottom-0 left-0 origin-bottom"
        style={{ width: stroke, height: size, background: tall, transform: "skewX(-13deg)" }}
      />
      <span
        className="absolute bottom-0 right-0 origin-bottom"
        style={{
          width: stroke,
          height: shortHeight,
          background: short,
          transform: "skewX(13deg)",
        }}
      />
    </span>
  );
}

type WordmarkProps = {
  /** `full` inclui o descritor INVEST abaixo; `inline` o põe ao lado. */
  variant?: "inline" | "full";
  size?: number;
  className?: string;
};

export function Wordmark({ variant = "inline", size = 24, className = "" }: WordmarkProps) {
  if (variant === "full") {
    return (
      <span className={`flex items-center gap-4 ${className}`}>
        <Mark size={size * 2} />
        <span>
          <span
            className="block font-display leading-none text-title"
            style={{ fontSize: size * 1.12, letterSpacing: "0.09em" }}
          >
            ACÁSSIUM
          </span>
          <span
            className="mt-1.5 block font-mono text-amber"
            style={{ fontSize: size * 0.42, letterSpacing: "0.34em" }}
          >
            INVEST
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Mark size={size} />
      <span
        className="font-display leading-none text-title"
        style={{ fontSize: size * 0.67, letterSpacing: "0.11em" }}
      >
        ACÁSSIUM
      </span>
      <span
        className="font-mono text-amber"
        style={{ fontSize: size * 0.42, letterSpacing: "0.3em" }}
      >
        INVEST
      </span>
    </span>
  );
}
