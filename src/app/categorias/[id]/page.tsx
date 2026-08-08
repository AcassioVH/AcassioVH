import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryBar } from "@/components/charts/CategoryBar";
import { PaymentChain } from "@/components/charts/PaymentChain";
import { ProductCard } from "@/components/charts/ProductCard";
import { TaxLadder } from "@/components/charts/TaxLadder";
import { Caustics, MarineSnow } from "@/components/experience/Caustics";
import { Footer } from "@/components/marketing/Footer";
import { Nav } from "@/components/marketing/Nav";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Reveal } from "@/components/ui/Reveal";
import { TrilhaJsonLd } from "@/components/seo/StructuredData";
import { WhatsAppCTA, WhatsAppStrip } from "@/components/ui/WhatsAppCTA";
import { site } from "@/config/site";
import { CATEGORIES, categoryById, familiesOf } from "@/domain/assets/families";
import { CATALOG_REVIEWED_AT } from "@/domain/assets/profiles";

/**
 * A página da categoria — o nível intermediário que faltava.
 *
 * Antes só havia dois degraus: a home e o verbete de um produto. Quem chegava
 * sabendo apenas "quero entender renda fixa" caía numa lista de dez siglas sem
 * nada entre uma coisa e outra.
 *
 * A página tem uma ordem deliberada, do geral ao específico:
 *
 *   1. o que a categoria é, em uma frase;
 *   2. quais famílias de pagamento existem dentro — cada uma com o diagrama do
 *      caminho do dinheiro, que é a parte que ensina;
 *   3. os produtos, um cartão cada, com as mesmas quatro perguntas em todos.
 *
 * Estática: `generateStaticParams` publica uma página por categoria, e nada aqui
 * depende de requisição, sessão ou banco.
 */
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ id: category.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = categoryById(id);
  if (!category) return {};

  return {
    title: category.label,
    description: `${category.summary} ${category.trait}`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = categoryById(id);
  if (!category) notFound();

  const families = familiesOf(category);
  const others = CATEGORIES.filter((other) => other.id !== category.id);

  // A escada do IR só aparece onde de fato descreve os produtos da página.
  // Mostrá-la em renda variável seria informação correta no lugar errado.
  const showsTaxLadder = category.id === "renda-fixa";

  return (
    <>
      <Nav />

      <main id="conteudo">
        <header className="relative overflow-hidden border-b border-edge-soft px-6 pb-16 pt-32 sm:px-10 sm:pb-20 sm:pt-40">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,#12333b,#0c2530_55%,#0b1d24)]"
          />
          <div
            aria-hidden="true"
            className="absolute left-[66%] top-[-90px] h-[440px] w-[150px] skew-x-[-10deg] bg-[linear-gradient(176deg,rgba(227,188,126,.16),transparent_68%)]"
          />
          <Caustics className="h-[62%] opacity-60" />
          <MarineSnow />

          <div className="relative mx-auto max-w-5xl">
            <Link
              href="/#categorias"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-tertiary transition-colors hover:text-light"
            >
              ← Todas as categorias
            </Link>

            <h1 className="mt-8 text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.03]">
              {category.label}
            </h1>

            <p className="mt-6 max-w-[54ch] text-xl leading-relaxed text-body">
              {category.summary}
            </p>

            <p
              className="mt-7 max-w-[54ch] border-l pl-5 text-lg leading-relaxed text-aux"
              style={{ borderColor: category.accent }}
            >
              {category.trait}
            </p>

            <div className="mt-10 max-w-sm">
              <CategoryBar category={category} />
            </div>
          </div>
        </header>

        {/* Nível 1 da página: quem paga, com o caminho desenhado. */}
        <section
          aria-labelledby="familias-title"
          className="border-b border-edge-soft bg-deep px-6 py-20 sm:px-10 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="tech text-amber">Passo 1 · quem paga você</p>
              <h2 id="familias-title" className="mt-5 text-[clamp(1.7rem,4vw,2.6rem)] leading-tight">
                {families.length === 1
                  ? "Uma origem de pagamento."
                  : `${families.length} origens de pagamento diferentes.`}
              </h2>
              <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-aux">
                É o que separa um produto do outro dentro da mesma categoria — mais do que a
                sigla, o prazo ou o nome de quem vendeu. Cada diagrama mostra por quantas
                mãos o dinheiro passa até chegar em você.
              </p>
            </Reveal>

            <ul className="mt-12 space-y-px">
              {families.map((family, index) => (
                <Reveal key={family.id} delay={index * 0.06} as="li">
                  <div className="border border-edge bg-surface/60 p-7 sm:p-9">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <h3 className="text-2xl leading-tight">{family.label}</h3>
                      <p
                        className="font-mono text-[11px] uppercase tracking-[0.14em]"
                        style={{ color: category.accent }}
                      >
                        {family.whoPays}
                      </p>
                    </div>

                    <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-aux">
                      {family.blurb}
                    </p>

                    <PaymentChain
                      chain={family.chain}
                      accent={category.accent}
                      className="mt-7"
                    />
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="mt-12">
              <WhatsAppStrip
                subject={`a categoria ${category.label.toLowerCase()}`}
                label={`Alguma dúvida sobre ${category.label.toLowerCase()}? Fale comigo no WhatsApp.`}
              />
            </div>
          </div>
        </section>

        {/* Nível 2: os produtos, com as mesmas quatro perguntas em cada um. */}
        <section
          aria-labelledby="produtos-title"
          className="border-b border-edge-soft bg-surface px-6 py-20 sm:px-10 sm:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="tech text-amber">Passo 2 · os produtos</p>
              <h2 id="produtos-title" className="mt-5 text-[clamp(1.7rem,4vw,2.6rem)] leading-tight">
                Escolha o que quer entender melhor.
              </h2>
              <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-aux">
                Todos respondem às mesmas quatro perguntas, sempre na mesma ordem. A lista
                não é ordenada por preferência — é a ordem do catálogo.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
              {families.flatMap((family) =>
                family.classes.map((assetClass) => (
                  <li key={assetClass} className="h-full">
                    <ProductCard assetClass={assetClass} accent={category.accent} />
                  </li>
                )),
              )}
            </ul>

            {showsTaxLadder ? (
              <Reveal>
                <div className="mt-16">
                  <TaxLadder />
                </div>
              </Reveal>
            ) : null}

            <footer className="mt-14 border-t border-edge-soft pt-7">
              <p className="font-mono text-[11px] text-muted">
                Conteúdo revisado em {CATALOG_REVIEWED_AT}
              </p>
              <Disclaimer className="mt-3" />
            </footer>
          </div>
        </section>

        {/* As outras portas, para quem chegou aqui e não era isto que procurava. */}
        <nav
          aria-label="Outras categorias"
          className="border-b border-edge-soft bg-deep px-6 py-16 sm:px-10"
        >
          <div className="mx-auto max-w-6xl">
            <p className="tech text-tertiary">Outras categorias</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={`/categorias/${other.id}`}
                    className="block border border-edge px-5 py-3 text-base text-body transition-colors duration-300 hover:border-light hover:text-light"
                  >
                    {other.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/comparar"
                  className="block border border-edge px-5 py-3 text-base text-light transition-colors duration-300 hover:border-light"
                >
                  Comparar dois produtos
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <WhatsAppCTA
          title={`Quer conversar sobre ${category.label.toLowerCase()}?`}
          subject={`a categoria ${category.label.toLowerCase()}`}
        />
      </main>

      <Footer />

      <TrilhaJsonLd
        itens={[
          { nome: site.name, url: site.url },
          { nome: category.label, url: `${site.url}/categorias/${category.id}` },
        ]}
      />
    </>
  );
}
