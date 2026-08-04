/**
 * Geometria das fatias de um gráfico de rosca em SVG.
 *
 * Pura e sem React de propósito: o cálculo é o mesmo na landing (dado
 * ilustrativo, animado) e no painel (dado real, estático), e duplicá-lo levaria
 * os dois a divergirem na primeira vez que alguém ajustasse o respiro entre
 * fatias em só um dos lados.
 */

export type DonutSegment<T> = {
  readonly item: T;
  /** Comprimento do traço, em unidades de contorno. */
  readonly length: number;
  /** Deslocamento acumulado até o início desta fatia. */
  readonly offset: number;
};

/**
 * Converte participações percentuais em traços de contorno.
 *
 * `gap` abre um respiro entre fatias — necessário porque categorias vizinhas da
 * paleta podem ter tons próximos e, encostadas, lerem como uma fatia só.
 */
export function donutSegments<T>(
  items: readonly T[],
  shareOf: (item: T) => number,
  circumference: number,
  gap: number,
): DonutSegment<T>[] {
  return items.reduce<DonutSegment<T>[]>((acc, item) => {
    const previous = acc[acc.length - 1];
    const offset = previous ? previous.offset + previous.length + gap : 0;
    const length = Math.max(0, (shareOf(item) / 100) * circumference - gap);

    acc.push({ item, length, offset });
    return acc;
  }, []);
}
