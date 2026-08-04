import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Disclaimer } from "@/components/ui/Disclaimer";
import { profileFor, TAX_NOTICE, CATALOG_REVIEWED_AT } from "@/domain/assets/profiles";
import { ASSET_CLASSES, type AssetClass } from "@/domain/assets/taxonomy";

/**
 * Ficha educativa de uma classe de ativo.
 *
 * A rota é estática por classe: o conteúdo é curado e igual para todo mundo.
 * Nada aqui depende da carteira de quem está lendo — descrevemos o tipo de
 * ativo, nunca o ativo específico do usuário.
 */
export function generateStaticParams() {
  return ASSET_CLASSES.map((classe) => ({ classe }));
}

function resolveClass(value: string): AssetClass | null {
  return (ASSET_CLASSES as readonly string[]).includes(value) ? (value as AssetClass) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classe: string }>;
}): Promise<Metadata> {
  const { classe } = await params;
  const assetClass = resolveClass(classe);
  if (!assetClass) return {};

  return { title: profileFor(assetClass).fullName };
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-gold">
        {label}
      </h2>
      <div className="text-sm leading-relaxed text-blue-200">{children}</div>
    </div>
  );
}

export default async function AssetProfilePage({
  params,
}: {
  params: Promise<{ classe: string }>;
}) {
  const { classe } = await params;
  const assetClass = resolveClass(classe);
  if (!assetClass) notFound();

  const profile = profileFor(assetClass);

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/carteira"
        className="text-sm text-blue-200 transition-colors hover:text-gold"
      >
        ← Voltar para a carteira
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl sm:text-4xl">{profile.fullName}</h1>
        <p className="mt-3 text-base text-blue-200">{profile.summary}</p>
      </header>

      <p className="mt-8 leading-relaxed text-mist/90">{profile.whatItIs}</p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <Block label="Quem emite">{profile.issuedBy}</Block>
        <Block label="Liquidez">{profile.liquidity}</Block>
        <Block label="Tributação">
          {profile.taxation}
          <span className="mt-2 block text-blue-200/60">{TAX_NOTICE}</span>
        </Block>
        <Block label="Garantia">{profile.guarantee.description}</Block>
      </div>

      <div className="mt-12">
        <Block label="Características">
          <ul className="space-y-2">
            {profile.characteristics.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
                {item}
              </li>
            ))}
          </ul>
        </Block>
      </div>

      <div className="mt-12 rounded-2xl border border-gold/20 bg-gold/[0.04] p-6 sm:p-8">
        <h2 className="mb-4 font-serif text-base text-gold">Conferir na fonte oficial</h2>
        <p className="mb-6 text-sm leading-relaxed text-blue-200">
          Não afirmamos rentabilidade nem valores de mercado. Estes são os lugares onde
          esse dado é publicado por quem tem autoridade para isso.
        </p>
        <ul className="space-y-4">
          {profile.officialSources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold underline decoration-gold/30 underline-offset-4 transition-colors hover:decoration-gold"
              >
                {source.label}
              </a>
              <span className="block text-sm text-blue-200/70">
                {source.whatYouFindThere}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-10 border-t border-blue/20 pt-6">
        <p className="text-xs text-blue-200/60">
          Conteúdo curado, revisado em {CATALOG_REVIEWED_AT}.
        </p>
        <Disclaimer className="mt-3" />
      </footer>
    </article>
  );
}
