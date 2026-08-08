import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GuaranteeMark } from "@/components/charts/GuaranteeMark";
import { Caustics, MarineSnow } from "@/components/experience/Caustics";
import { PaymentChain } from "@/components/charts/PaymentChain";
import { Footer } from "@/components/marketing/Footer";
import { Nav } from "@/components/marketing/Nav";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { TrilhaJsonLd, VerbeteJsonLd } from "@/components/seo/StructuredData";
import { WhatsAppCTA, WhatsAppStrip } from "@/components/ui/WhatsAppCTA";
import { site } from "@/config/site";
import { CATALOGUED_CLASSES, categoryOfClass, familyOf } from "@/domain/assets/families";
import { CATALOG_REVIEWED_AT, TAX_NOTICE, profileFor } from "@/domain/assets/profiles";
import type { AssetClass } from "@/domain/assets/taxonomy";

/**
 * Verbete completo de um produto — página própria.
 *
 * Existe separada da home por dois motivos: é endereçável, então serve de
 * resposta a uma busca por "o que é um CRA"; e é onde o conteúdo pode respirar
 * sem competir com o resto da descida.
 *
 * Estática: nada aqui depende de requisição, sessão ou banco.
 */
export function generateStaticParams() {
  return CATALOGUED_CLASSES.map((classe) => ({ classe }));
}

function resolve(value: string): AssetClass | null {
  return (CATALOGUED_CLASSES as readonly string[]).includes(value)
    ? (value as AssetClass)
    : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classe: string }>;
}): Promise<Metadata> {
  const { classe } = await params;
  const assetClass = resolve(classe);
  if (!assetClass) return {};

  const profile = profileFor(assetClass);
  return {
    title: profile.fullName,
    description: `${profile.summary} ${profile.whatItIs.slice(0, 110)}…`,
  };
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-edge-soft pt-6">
      <h2 className="tech mb-3 text-tertiary">{label}</h2>
      <div className="text-lg leading-relaxed text-aux">{children}</div>
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ classe: string }>;
}) {
  const { classe } = await params;
  const assetClass = resolve(classe);
  if (!assetClass) notFound();

  const profile = profileFor(assetClass);
  const family = familyOf(assetClass);
  const category = categoryOfClass(assetClass);
  const accent = category?.accent ?? "var(--color-light)";
  const siblings = (family?.classes ?? []).filter((c) => c !== assetClass);

  return (
    <>
      <Nav />

      <main id="conteudo">
        {/* Cabeçalho na zona iluminada: o produto em plena luz. */}
        <header className="relative overflow-hidden border-b border-edge-soft px-6 pb-16 pt-32 sm:px-10 sm:pb-20 sm:pt-40">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,#12333b,#0c2530_55%,#0b1d24)]"
          />
          <div
            aria-hidden="true"
            className="absolute left-[64%] top-[-90px] h-[440px] w-[150px] skew-x-[-10deg] bg-[linear-gradient(176deg,rgba(227,188,126,.16),transparent_68%)]"
          />
          <Caustics className="h-[62%] opacity-60" />
          <MarineSnow />

          <div className="relative mx-auto max-w-4xl">
            <Link
              href={category ? `/categorias/${category.id}` : "/#categorias"}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-tertiary transition-colors hover:text-light"
            >
              ← {category ? category.label : "Todas as categorias"}
            </Link>

            {family ? (
              <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em]" style={{ color: accent }}>
                {family.label}
              </p>
            ) : null}

            <h1 className="mt-5 text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.03]">
              {profile.fullName}
            </h1>

            <p className="mt-6 max-w-[56ch] text-xl leading-relaxed text-body">
              {profile.summary}
            </p>

            {/* As três respostas de sempre, antes de qualquer parágrafo: quem
                garante, quando sai o dinheiro, como é o imposto. */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <GuaranteeMark kind={profile.guarantee.kind} />
              <span className="border border-edge px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-tertiary">
                Resgate: {profile.liquidityTag}
              </span>
              <span className="border border-edge px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-tertiary">
                Imposto: {profile.taxTag}
              </span>
            </div>
          </div>
        </header>

        <article className="bg-deep px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <p className="max-w-[64ch] text-xl leading-[1.8] text-body">{profile.whatItIs}</p>

            {family ? (
              <figure className="mt-12 border border-edge bg-surface/60 p-7 sm:p-9">
                <figcaption className="tech mb-6 text-tertiary">
                  O caminho do dinheiro até você
                </figcaption>
                <PaymentChain chain={family.chain} accent={accent} />
                <p className="mt-6 text-sm leading-relaxed text-muted">
                  Quem paga: {family.whoPays}. O diagrama descreve a estrutura do
                  pagamento — quantos elos existem não indica mérito nem risco.
                </p>
              </figure>
            ) : null}

            <div className="mt-14 grid gap-8 sm:grid-cols-2">
              <Block label="Quem emite">{profile.issuedBy}</Block>
              <Block label="Liquidez">{profile.liquidity}</Block>
              <Block label="Tributação">
                {profile.taxation}
                <span className="mt-3 block text-base text-muted">{TAX_NOTICE}</span>
              </Block>
              <Block label="Garantia">{profile.guarantee.description}</Block>
            </div>

            <div className="mt-14">
              <Block label="Características da estrutura">
                <ul className="space-y-3">
                  {profile.characteristics.map((item) => (
                    <li key={item} className="flex gap-3.5">
                      <span aria-hidden="true" className="mt-3 size-1 shrink-0 bg-amber" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Block>
            </div>

            <div className="mt-14">
              <WhatsAppStrip
                subject={`o ${profile.fullName}`}
                label={`Ficou com dúvida sobre ${profile.label}? Fale comigo no WhatsApp.`}
              />
            </div>

            {/* Nível 4: os documentos. */}
            <section className="mt-16 border border-edge bg-surface p-8 sm:p-10">
              <p className="tech mb-3 text-light">Nível 4 · onde conferir</p>
              <p className="mb-7 max-w-[62ch] text-base leading-relaxed text-aux">
                Não afirmamos rentabilidade, cotação nem limites vigentes. Estes são os
                lugares onde esse dado é publicado por quem tem autoridade para isso.
              </p>
              <ul className="space-y-5">
                {profile.officialSources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-base text-light underline decoration-light/30 underline-offset-4 transition-colors hover:decoration-light"
                    >
                      {source.label} ↗
                    </a>
                    <span className="mt-1 block text-base text-tertiary">
                      {source.whatYouFindThere}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {siblings.length > 0 ? (
              <nav aria-label="Produtos da mesma família" className="mt-14">
                <p className="tech mb-4 text-tertiary">Mesma família</p>
                <ul className="flex flex-wrap gap-2">
                  {siblings.map((sibling) => (
                    <li key={sibling}>
                      <Link
                        href={`/produtos/${sibling}`}
                        className="block border border-edge px-4 py-2.5 text-base text-body transition-colors duration-300 hover:border-light hover:text-light"
                      >
                        {profileFor(sibling).fullName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <footer className="mt-14 border-t border-edge-soft pt-7">
              <p className="font-mono text-[11px] text-muted">
                Verbete revisado em {CATALOG_REVIEWED_AT}
              </p>
              <Disclaimer className="mt-3" />
            </footer>
          </div>
        </article>

        {/* O destino, também aqui: quem chegou ao fim de um verbete é quem mais
            provavelmente quer conversar. */}
        <WhatsAppCTA
          title="Ficou com dúvida sobre este produto?"
          subject={`o ${profile.fullName}`}
        />

      </main>

      <Footer />

      <VerbeteJsonLd
        termo={profile.label}
        nomeCompleto={profile.fullName}
        definicao={profile.summary}
        url={`${site.url}/produtos/${assetClass}`}
      />
      <TrilhaJsonLd
        itens={[
          { nome: site.name, url: site.url },
          ...(category
            ? [{ nome: category.label, url: `${site.url}/categorias/${category.id}` }]
            : []),
          { nome: profile.fullName, url: `${site.url}/produtos/${assetClass}` },
        ]}
      />
    </>
  );
}
