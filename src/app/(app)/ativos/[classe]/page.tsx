import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusPill } from "@/components/ui/StatusPill";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { profileFor, TAX_NOTICE, CATALOG_REVIEWED_AT } from "@/domain/assets/profiles";
import { ASSET_CLASSES, type AssetClass } from "@/domain/assets/taxonomy";

/**
 * Verbete de uma classe de ativo — nível 3 da escala de profundidade.
 *
 * Descreve o TIPO de ativo, nunca o ativo específico do usuário. É essa
 * distinção que mantém o produto do lado descritivo da linha, e por isso a
 * página não recebe nada da carteira de quem está lendo.
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
  return assetClass ? { title: profileFor(assetClass).fullName } : {};
}

const GUARANTEE_LABEL: Record<string, string> = {
  FGC: "COBERTO PELO FGC",
  TESOURO_NACIONAL: "TESOURO NACIONAL",
  GARANTIA_REAL: "GARANTIA DA EMISSÃO",
  SEM_GARANTIA_ESPECIFICA: "SEM COBERTURA DO FGC",
};

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="tech mb-2.5 text-tertiary">{label}</h2>
      <div className="text-base leading-relaxed text-aux">{children}</div>
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
    <article className="mx-auto max-w-4xl">
      <Link
        href="/carteira"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-tertiary transition-colors hover:text-light"
      >
        ← Voltar para a carteira
      </Link>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6 border-b border-edge-soft pb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-light">
            {profile.label} · nível 3 · estrutura
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl">{profile.fullName}</h1>
          <p className="mt-3 max-w-[62ch] text-lg text-aux">{profile.summary}</p>
        </div>
        <StatusPill
          tone={profile.guarantee.kind === "SEM_GARANTIA_ESPECIFICA" ? "unavailable" : "identified"}
          label={GUARANTEE_LABEL[profile.guarantee.kind] ?? "GARANTIA"}
        />
      </header>

      <p className="mt-8 max-w-[64ch] text-lg leading-[1.75] text-body">{profile.whatItIs}</p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <Block label="Quem emite">{profile.issuedBy}</Block>
        <Block label="Liquidez">{profile.liquidity}</Block>
        <Block label="Tributação">
          {profile.taxation}
          <span className="mt-2 block text-muted">{TAX_NOTICE}</span>
        </Block>
        <Block label="Garantia">{profile.guarantee.description}</Block>
      </div>

      <div className="mt-12">
        <Block label="Características">
          <ul className="space-y-2.5">
            {profile.characteristics.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 bg-amber" />
                {item}
              </li>
            ))}
          </ul>
        </Block>
      </div>

      {/* Nível 4: os documentos e as fontes. */}
      <section className="mt-12 border border-edge bg-deep p-7 sm:p-8">
        <h2 className="tech mb-3 text-light">Nível 4 · onde conferir</h2>
        <p className="mb-6 max-w-[64ch] text-base leading-relaxed text-aux">
          Não afirmamos rentabilidade nem valores de mercado. Estes são os lugares onde esse
          dado é publicado por quem tem autoridade para isso.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {profile.officialSources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-edge bg-inset px-3.5 py-2.5 font-mono text-xs text-light transition-colors duration-200 hover:border-light/70"
            >
              {source.label} ↗
            </a>
          ))}
        </div>
        <ul className="mt-5 space-y-1.5">
          {profile.officialSources.map((source) => (
            <li key={source.url} className="text-sm text-muted">
              <span className="text-tertiary">{source.label}</span> — {source.whatYouFindThere}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 border-t border-edge-soft pt-6">
        <p className="font-mono text-[11px] text-muted">
          Verbete revisado em {CATALOG_REVIEWED_AT}
        </p>
        <Disclaimer className="mt-3" />
      </footer>
    </article>
  );
}
