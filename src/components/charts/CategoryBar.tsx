/**
 * A barra que mostra do que uma categoria é feita.
 *
 * Cada segmento é uma família de pagamento dentro da categoria, e a largura é a
 * quantidade de produtos catalogados naquela família. Serve para uma coisa só:
 * revelar, antes de clicar, que "renda fixa" não é um bloco único — são quatro
 * pagadores diferentes debaixo do mesmo nome.
 *
 * A grandeza medida é contagem do catálogo. Não é volume de mercado, não é
 * captação, não é preferência: quantos verbetes existem ali dentro. Uma barra
 * maior significa mais material para ler, e nada além disso.
 *
 * O gráfico é redundante de propósito — a lista de famílias vem escrita logo
 * abaixo. Quem não enxerga a barra não perde informação nenhuma.
 */

import { familiesOf, type Category } from "@/domain/assets/families";

/** Opacidade decrescente por segmento: distingue vizinhos sem inventar cores. */
function shade(index: number): number {
  return Math.max(0.28, 1 - index * 0.22);
}

export function CategoryBar({ category }: { category: Category }) {
  const families = familiesOf(category);
  const total = families.reduce((sum, family) => sum + family.classes.length, 0);
  if (total === 0) return null;

  return (
    <div>
      <div
        aria-hidden="true"
        className="flex h-1.5 w-full gap-px overflow-hidden"
        style={{ background: "var(--color-edge-soft)" }}
      >
        {families.map((family, index) => (
          <span
            key={family.id}
            className="block h-full transition-opacity duration-500"
            style={{
              width: `${(family.classes.length / total) * 100}%`,
              background: category.accent,
              opacity: shade(index),
            }}
          />
        ))}
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted">
        {families.length} {families.length === 1 ? "família" : "famílias"} · {total}{" "}
        {total === 1 ? "produto" : "produtos"}
      </p>
    </div>
  );
}
