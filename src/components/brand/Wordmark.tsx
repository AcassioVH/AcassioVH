/**
 * A marca: o "A" reduzido às duas hastes.
 *
 * A haste maior é o ativo; a menor, **apoiada nela**, é a explicação. A travessa
 * que fecharia a letra — e daria a conclusão — está ausente por decisão: a marca
 * sustenta, não conclui. Por isso o símbolo não deve ser "corrigido" com uma
 * barra transversal em nenhuma variação futura.
 *
 * **Dois erros já foram cometidos aqui. Os dois valem lembrar.**
 *
 * O primeiro: as hastes eram retângulos inclinados ancorados na base, e nunca se
 * encostavam. Duas barras paralelas não são um "A" e, pior, não dizem a tese —
 * se a menor não toca a maior, nada está apoiado em nada.
 *
 * O segundo: com as hastes desenhadas como `stroke`, a ponta de cada uma sai
 * cortada **perpendicular ao próprio ângulo**. Como as duas inclinações são
 * diferentes, os pés saíam cortados em ângulos diferentes e com larguras
 * diferentes — a marca não assentava. Daí o desenho atual ser de polígonos, e
 * não de traços: só assim as duas bases ficam horizontais, na mesma linha e com
 * a mesma largura.
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
  /** Altura da caixa da marca, em pixels. */
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
 * As duas hastes têm 21 de largura horizontal e terminam na mesma linha de base
 * (y = 97), o que dá pés idênticos. A menor nasce em y = 30, onde o corpo da
 * maior ocupa exatamente 38,45 a 59,45 — ou seja, o topo dela começa **dentro**
 * da maior, e não encostado na borda. Encostar na borda deixaria um fio de fundo
 * visível na junção assim que a tela arredondasse o subpixel.
 *
 * Mexer em um número destes sem refazer a conta quebra o encaixe. As duas
 * espessuras perpendiculares resultantes são 19,7 e 19,5: praticamente iguais,
 * que é o que faz as hastes parecerem do mesmo peso apesar de inclinações
 * diferentes.
 */
const HASTE_MAIOR = "M48.5 3 L69.5 3 L34.5 97 L13.5 97 Z";
const HASTE_MENOR = "M38.45 30 L59.45 30 L86.5 97 L65.5 97 Z";

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
      <path d={HASTE_MENOR} fill={short} />
      <path d={HASTE_MAIOR} fill={tall} />
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
