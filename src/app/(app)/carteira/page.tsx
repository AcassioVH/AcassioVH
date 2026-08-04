import type { Metadata } from "next";
import Link from "next/link";

import {
  CategoryDonut,
  CategoryLegend,
  InstitutionBars,
} from "@/components/portfolio/CompositionCharts";
import { AssetForm } from "@/components/portfolio/AssetForm";
import { profileFor } from "@/domain/assets/profiles";
import { ASSET_CLASSES } from "@/domain/assets/taxonomy";
import {
  FGC_LIMIT_PER_INSTITUTION_CENTS,
  byCategory,
  byInstitution,
  fgcExposure,
  maturityCalendar,
  pendingConfirmation,
  totalCents,
} from "@/domain/portfolio/analysis";
import { formatCents } from "@/domain/portfolio/money";
import {
  confirmClassAction,
  deleteAssetAction,
  loadPortfolio,
} from "@/lib/portfolio/actions";

export const metadata: Metadata = { title: "Sua carteira" };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function Card({
  title,
  children,
  footnote,
}: {
  title: string;
  children: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    <section className="surface rounded-2xl p-6 sm:p-8">
      <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-gold">
        {title}
      </h2>
      {children}
      {footnote ? (
        <p className="mt-6 border-t border-blue/20 pt-4 text-xs leading-relaxed text-blue-200/70">
          {footnote}
        </p>
      ) : null}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="surface rounded-2xl p-10 text-center">
      <h2 className="text-2xl">Sua carteira está vazia</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-blue-200">
        Adicione o primeiro ativo com nome, valor e — quando houver — CNPJ e
        instituição. A leitura por classe, instituição, FGC e vencimentos aparece
        assim que existir algo para organizar.
      </p>
    </div>
  );
}

export default async function PortfolioPage() {
  const assets = await loadPortfolio();

  const total = totalCents(assets);
  const categories = byCategory(assets);
  const institutions = byInstitution(assets);
  const fgc = fgcExposure(assets);
  const maturities = maturityCalendar(assets);
  const pending = pendingConfirmation(assets);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl">Sua carteira</h1>
        <p className="mt-3 text-sm text-blue-200">
          Total declarado:{" "}
          <span className="font-serif text-lg text-mist">{formatCents(total)}</span>
          {assets.length > 0 ? (
            <span className="text-blue-200/70">
              {" "}
              · {assets.length} {assets.length === 1 ? "ativo" : "ativos"}
            </span>
          ) : null}
        </p>
        <p className="mt-2 text-xs text-blue-200/60">
          Soma dos valores que você informou. Não calculamos rendimento nem atualizamos
          cotação — para valores de mercado, consulte a fonte oficial indicada na ficha de
          cada ativo.
        </p>
      </header>

      {pending.length > 0 ? (
        <section className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-6 sm:p-8">
          <h2 className="text-base text-gold">Confirme a classificação</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-200">
            Não conseguimos identificar com segurança o tipo destes ativos pelo nome e pelo
            CNPJ informados. Preferimos perguntar a exibir uma ficha que pode não
            corresponder ao que você tem.
          </p>

          <ul className="mt-6 space-y-4">
            {pending.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-4 border-t border-gold/15 pt-4"
              >
                <span className="text-sm text-mist">{asset.name}</span>
                <form action={confirmClassAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={asset.id} />
                  <label htmlFor={`class-${asset.id}`} className="sr-only">
                    Classe de {asset.name}
                  </label>
                  <select
                    id={`class-${asset.id}`}
                    name="assetClass"
                    defaultValue={asset.assetClass}
                    className="rounded-lg border border-blue/40 bg-navy-800 px-3 py-2 text-sm text-mist"
                  >
                    {ASSET_CLASSES.filter((c) => c !== "NAO_CLASSIFICADO").map((assetClass) => (
                      <option key={assetClass} value={assetClass}>
                        {profileFor(assetClass).label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-gold-200"
                  >
                    Confirmar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {assets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Por classe de ativo">
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                <CategoryDonut slices={categories} />
                <CategoryLegend slices={categories} />
              </div>
            </Card>

            <Card
              title="Por instituição"
              footnote="A cobertura do FGC é contada por CPF e por instituição, por isso a distribuição entre instituições aparece separada da distribuição por classe."
            >
              <InstitutionBars slices={institutions} />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card
              title="Segurança e estrutura — FGC"
              footnote={
                <>
                  Considera apenas ativos de tipos cobertos pelo FGC (CDB, LCI, LCA, LC e
                  poupança). Limite vigente considerado:{" "}
                  {formatCents(FGC_LIMIT_PER_INSTITUTION_CENTS)} por CPF e por instituição,
                  com teto global por período. Confirme as regras atuais em{" "}
                  <a
                    href="https://www.fgc.org.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline-offset-4 hover:underline"
                  >
                    fgc.org.br
                  </a>
                  .
                </>
              }
            >
              {fgc.length === 0 ? (
                <p className="text-sm text-blue-200">
                  Nenhum ativo de tipo coberto pelo FGC na sua carteira.
                </p>
              ) : (
                <ul className="space-y-4">
                  {fgc.map((entry) => (
                    <li
                      key={entry.institution}
                      className="border-b border-blue/20 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm text-mist">{entry.institution}</span>
                        <span className="font-serif text-base text-mist">
                          {formatCents(entry.coveredValueCents)}
                        </span>
                      </div>
                      {entry.aboveLimitCents > 0 ? (
                        <p className="mt-2 text-xs text-gold">
                          {formatCents(entry.aboveLimitCents)} acima do limite de cobertura
                          por instituição.
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-blue-200/70">
                          Dentro do limite de cobertura por instituição.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              title="Calendário de vencimentos"
              footnote="Datas conforme informadas por você. Ativos sem vencimento, como ações e fundos abertos, não aparecem aqui."
            >
              {maturities.length === 0 ? (
                <p className="text-sm text-blue-200">
                  Nenhum ativo com data de vencimento informada.
                </p>
              ) : (
                <ul className="space-y-4">
                  {maturities.map((entry) => (
                    <li
                      key={entry.asset.id}
                      className="flex flex-wrap items-baseline justify-between gap-3 border-b border-blue/20 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-sm text-mist">{entry.asset.name}</span>
                      <span className="text-right text-xs text-blue-200">
                        {dateFormatter.format(entry.maturityDate)}
                        <span className="ml-2 text-blue-200/60">
                          {entry.daysUntil < 0
                            ? "vencido"
                            : entry.daysUntil === 0
                              ? "vence hoje"
                              : `em ${entry.daysUntil} dias`}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card title="Ativos declarados">
            <ul className="space-y-4">
              {assets.map((asset) => {
                const profile = profileFor(asset.assetClass);
                return (
                  <li
                    key={asset.id}
                    className="flex flex-wrap items-start justify-between gap-4 border-b border-blue/20 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-mist">{asset.name}</p>
                      <p className="mt-1 text-xs text-blue-200/70">
                        <Link
                          href={`/ativos/${asset.assetClass}`}
                          className="text-gold underline-offset-4 hover:underline"
                        >
                          {profile.label}
                        </Link>
                        {asset.institution ? ` · ${asset.institution}` : ""}
                        {asset.cnpj ? ` · CNPJ ${asset.cnpj}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-base text-mist">
                        {formatCents(asset.valueCents)}
                      </span>
                      <form action={deleteAssetAction}>
                        <input type="hidden" name="id" value={asset.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-blue-200/25 px-3 py-1.5 text-xs text-blue-200 transition-colors hover:border-gold/60 hover:text-gold"
                        >
                          Remover
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}

      <Card title="Adicionar ativo">
        <div className="max-w-xl">
          <AssetForm />
        </div>
      </Card>
    </div>
  );
}
