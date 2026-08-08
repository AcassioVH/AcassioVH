/**
 * As categorias — a porta de entrada do site.
 *
 * O visitante chega com um vocabulário: "renda fixa", "renda variável",
 * "internacional". Começar por aí respeita o que ele já sabe. O que ele descobre
 * ao entrar é o corte que de fato importa — para onde vai o seu dinheiro — e essa
 * é o conteúdo, não a arrumação.
 *
 * **O cartão dizia pouco demais, e ninguém clicava por curiosidade.** A versão
 * anterior mostrava a frase da categoria e a contagem — "4 destinos · 14
 * produtos" — e parava aí. Contagem é um número; ela informa que existe volume e
 * não dá nenhum motivo para descer. Quem já sabia o que procurava clicava; quem
 * não sabia via seis retângulos parecidos e ia embora.
 *
 * Agora o cartão mostra a substância antes do clique: **para onde o dinheiro vai
 * parar** (o Tesouro, um banco, uma empresa, uma carteira de recebíveis) e **as
 * siglas que existem lá dentro**. Ver "CDB · LCI · CRI · Debênture" no mesmo
 * cartão é o que transforma "renda fixa" de rótulo em promessa — e a promessa é
 * verificável, porque tudo ali é link para uma ficha que existe.
 *
 * O convite é explícito ("Entrar e aprofundar") porque o gesto não era óbvio: o
 * cartão inteiro sempre foi clicável e nada dizia isso com todas as letras.
 *
 * **O que continua fora daqui.** As siglas aparecem como etiqueta, não como
 * link: um `<a>` dentro de outro `<a>` é HTML inválido, e o destino de cada uma
 * está a um clique de distância na página da categoria. E a ordem é a do
 * catálogo, sempre — ordenar categorias por qualquer critério de mérito seria
 * classificar, e o site não classifica.
 */

import Link from "next/link";

import { CategoryBar } from "@/components/charts/CategoryBar";
import { MarineSnow } from "@/components/experience/Caustics";
import { Reveal } from "@/components/ui/Reveal";
import { CATALOGUED_CLASSES, CATEGORIES, destinationsOf } from "@/domain/assets/destinations";
import { profileFor } from "@/domain/assets/profiles";

export function CategoriesSection() {
  return (
    <section
      id="categorias"
      data-depth="3"
      aria-labelledby="categorias-title"
      className="relative overflow-hidden border-t border-edge-soft bg-surface px-6 py-24 sm:px-10 sm:py-32"
    >
      <MarineSnow className="opacity-40" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="tech text-amber">Por onde começar</p>
          <h2
            id="categorias-title"
            className="mt-6 max-w-[20ch] text-[clamp(2rem,5vw,3.4rem)] leading-[1.04]"
          >
            Você conhece as siglas. Sabe para onde elas levam o seu dinheiro?
          </h2>
          <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-aux">
            Cada categoria abre em destinos, e cada destino termina num lugar concreto — o
            Tesouro Nacional, um banco, uma empresa, uma carteira de recebíveis. Clique em
            qualquer uma para sair da superfície: lá dentro estão o caminho do dinheiro, os
            produtos e a ficha completa de cada um.
          </p>

          {/*
            O empurrão para descer.

            A pessoa acabou de ler uma pergunta e precisa saber que a resposta
            está logo abaixo, não em outra página. A seta se move devagar e o
            texto diz a mesma coisa — quem não enxerga o movimento não perde
            informação nenhuma.
          */}
          <p className="mt-10 flex items-center gap-3 font-mono text-[11px] uppercase leading-5 tracking-[0.16em] text-light">
            <span aria-hidden="true" className="animate-descend inline-block">
              ↓
            </span>
            Role e veja o que existe dentro de cada uma — {CATEGORIES.length} categorias,{" "}
            {CATALOGUED_CLASSES.length} produtos
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, index) => {
            const destinations = destinationsOf(category);
            const classes = destinations.flatMap((destination) => destination.classes);

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

                  <div className="mt-7">
                    <CategoryBar category={category} />
                  </div>

                  <p className="mt-7 font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted">
                    O dinheiro vai para
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-tertiary">
                    {destinations.map((destination) => destination.target).join(" · ")}
                  </p>

                  <p className="mt-6 font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted">
                    O que você vai encontrar
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {classes.map((assetClass) => (
                      <li
                        key={assetClass}
                        className="border border-edge-soft px-2 py-1 font-mono text-[10px] uppercase leading-4 tracking-[0.1em] text-aux transition-colors duration-500 group-hover:border-edge"
                      >
                        {profileFor(assetClass).label}
                      </li>
                    ))}
                  </ul>

                  <span
                    className="mt-auto pt-8 font-mono text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: category.accent }}
                  >
                    Entrar e aprofundar{" "}
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
