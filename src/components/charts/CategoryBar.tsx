/**
 * A barra que mostra do que uma categoria é feita.
 *
 * Cada segmento é um destino do dinheiro dentro da categoria, e a largura é a
 * quantidade de produtos catalogados naquele destino. Serve para uma coisa só:
 * revelar, antes de clicar, que "renda fixa" não é um bloco único — o dinheiro
 * vai para quatro lugares diferentes debaixo do mesmo nome.
 *
 * A grandeza medida é contagem do catálogo. Não é volume de mercado, não é
 * captação, não é preferência: quantos verbetes existem ali dentro. Uma barra
 * maior significa mais material para ler, e nada além disso.
 *
 * O gráfico é redundante de propósito — a lista de destinos vem escrita logo
 * abaixo. Quem não enxerga a barra não perde informação nenhuma.
 */

import { destinationsOf, type Category } from "@/domain/assets/destinations";

/** Opacidade decrescente por segmento: distingue vizinhos sem inventar cores. */
function shade(index: number): number {
  return Math.max(0.28, 1 - index * 0.22);
}

export function CategoryBar({ category }: { category: Category }) {
  const destinations = destinationsOf(category);
  const total = destinations.reduce((sum, destination) => sum + destination.classes.length, 0);
  if (total === 0) return null;

  return (
    <div>
      <div
        aria-hidden="true"
        className="flex h-1.5 w-full gap-px overflow-hidden"
        style={{ background: "var(--color-edge-soft)" }}
      >
        {destinations.map((destination, index) => (
          <span
            key={destination.id}
            className="block h-full transition-opacity duration-500"
            style={{
              width: `${(destination.classes.length / total) * 100}%`,
              background: category.accent,
              opacity: shade(index),
            }}
          />
        ))}
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted">
        {destinations.length} {destinations.length === 1 ? "destino" : "destinos"} · {total}{" "}
        {total === 1 ? "produto" : "produtos"}
      </p>
    </div>
  );
}
