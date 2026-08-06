/**
 * As categorias — a porta de entrada do site.
 *
 * O visitante chega com um vocabulário: "renda fixa", "renda variável",
 * "internacional". Começar por aí respeita o que ele já sabe. O que ele descobre
 * ao entrar é o corte que de fato importa — quem paga você — e essa descoberta
 * é o conteúdo, não a arrumação.
 *
 * O cartão diz o mínimo: uma frase do que a categoria é, o traço estrutural
 * comum, a barra do que há dentro e os nomes das famílias. Tudo o mais fica na
 * página da categoria. A tentação de explicar aqui é a mesma que transformou a
 * versão anterior em parede de texto.
 *
 * A ordem é a do catálogo e não muda por nada: ordenar categorias por qualquer
 * critério de mérito seria classificar, e o site não classifica.
 */

import Link from "next/link";

import { CategoryBar } from "@/components/charts/CategoryBar";
import { Reveal } from "@/components/ui/Reveal";
import { CATEGORIES, familiesOf } from "@/domain/assets/families";

export function CategoriesSection() {
  return (
    <section
      id="categorias"
      data-depth="3"
      aria-labelledby="categorias-title"
      className="relative border-t border-edge-soft bg-surface px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="tech text-amber">Por onde começar</p>
          <h2
            id="categorias-title"
            className="mt-6 max-w-[18ch] text-[clamp(2rem,5vw,3.4rem)] leading-[1.04]"
          >
            As categorias do mercado.
          </h2>
          <p className="mt-7 max-w-[56ch] text-lg leading-relaxed text-aux">
            Escolha por onde entrar. Dentro de cada categoria, os produtos estão separados
            por quem efetivamente paga o investidor.
          </p>
        </Reveal>

        <ul className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, index) => {
            const families = familiesOf(category);

            return (
              <Reveal key={category.id} delay={index * 0.06} as="li">
                <Link
                  href={`/categorias/${category.id}`}
                  className="group flex h-full flex-col border border-edge bg-inset/70 p-8 transition-colors duration-500 hover:border-light/45 hover:bg-inset"
                >
                  <span
                    aria-hidden="true"
                    className="block h-px w-10 transition-all duration-500 group-hover:w-20"
                    style={{ background: category.accent }}
                  />

                  <h3 className="mt-7 text-2xl leading-tight">{category.label}</h3>

                  <p className="mt-4 text-base leading-relaxed text-body">{category.summary}</p>

                  <p className="mt-5 border-l pl-4 text-sm leading-relaxed text-tertiary"
                     style={{ borderColor: category.accent }}>
                    {category.trait}
                  </p>

                  <div className="mt-8">
                    <CategoryBar category={category} />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-tertiary">
                    {families.map((family) => family.label).join(" · ")}
                  </p>

                  <span className="mt-auto pt-7 font-mono text-[11px] uppercase tracking-[0.16em] text-light">
                    Entrar{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
