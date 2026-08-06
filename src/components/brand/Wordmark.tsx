/**
 * A marca: o "A" reduzido às duas hastes.
 *
 * A haste maior é o ativo; a menor, **apoiada nela**, é a explicação. A travessa
 * que fecharia a letra — e daria a conclusão — está ausente por decisão: a marca
 * sustenta, não conclui. Por isso o símbolo não deve ser "corrigido" com uma
 * barra transversal em nenhuma variação futura.
 *
 * **O erro da primeira versão, e por que ele importava.** As hastes eram dois
 * retângulos inclinados, cada um ancorado na base, que nunca se encostavam. Duas
 * barras paralelas não são um "A" e, pior, não dizem a tese: se a haste menor
 * não toca a maior, nada está apoiado em nada. A correção não foi aproximá-las —
 * foi desenhar a menor **partindo de dentro** da maior, que é o que "apoiada"
 * significa. Em SVG, porque duas caixas posicionadas não encostam sem emenda.
 *
 * A ordem de desenho é parte do desenho: a haste menor vem primeiro e a maior
 * por cima, então a junção some sob a haste que sustenta.
 *
 * **Cor.** A haste maior é clara e a menor é âmbar — nunca duas âmbares, que
 * apagam a hierarquia, nem âmbar escuro na menor, que some no fundo. O padrão da
 * menor é `--color-light`, e não `--color-amber`, justamente porque em tamanho
 * pequeno sobre fundo escuro o âmbar fechado deixa de ser legível.
 */

type MarkProps = {
  /** Altura da haste maior, em pixels. */
  size?: number;
  /** Cor da haste maior — a que sustenta. */
  tall?: string;
  /** Cor da haste menor — a apoiada. */
  short?: string;
  className?: string;
};

/**
 * Geometria, em coordenadas de 0 a 100.
 *
 * A haste menor nasce em `JOIN`, um ponto que fica **dentro** do corpo da haste
 * maior, e não na borda dela: encostar na borda deixaria um fio de fundo visível
 * na junção assim que a tela arredondasse o subpixel.
 */
const TALL_TOP = { x: 66, y: 3 };
const TALL_FOOT = { x: 25, y: 97 };
const JOIN = { x: 56, y: 30 };
const SHORT_FOOT = { x: 87, y: 97 };

export function Mark({
  size = 24,
  tall = "var(--color-title)",
  short = "var(--color-light)",
  className = "",
}: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={`block shrink-0 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d={`M${JOIN.x} ${JOIN.y} L${SHORT_FOOT.x} ${SHORT_FOOT.y}`}
        stroke={short}
        strokeWidth={16}
      />
      <path
        d={`M${TALL_TOP.x} ${TALL_TOP.y} L${TALL_FOOT.x} ${TALL_FOOT.y}`}
        stroke={tall}
        strokeWidth={19}
      />
    </svg>
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
      <Mark size={size * 1.25} />
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
