import type { Metadata } from "next";
import Link from "next/link";

import { AssetForm } from "@/components/portfolio/AssetForm";
import { CategoryBars, InstitutionBars } from "@/components/portfolio/CompositionCharts";
import { StatusPill } from "@/components/ui/StatusPill";
import { profileFor } from "@/domain/assets/profiles";
import { ASSET_CLASSES } from "@/domain/assets/taxonomy";
import {
  FGC_LIMIT_PER_INSTITUTION_CENTS,
  byCategory,
  byInstitution,
  fgcExposure,
  identificationStatus,
  maturityCalendar,
  pendingConfirmation,
  statusCounts,
  totalCents,
} from "@/domain/portfolio/analysis";
import { formatCents } from "@/domain/portfolio/money";
import { confirmClassAction, deleteAssetAction, loadPortfolio } from "@/lib/portfolio/actions";

export const metadata: Metadata = { title: "Minha carteira" };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function Panel({
  title,
  children,
  note,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-edge bg-surface p-6 sm:p-7 ${className}`}>
      <h2 className="tech mb-6 text-tertiary">{title}</h2>
      {children}
      {note ? (
        <p className="mt-6 border-t border-edge-soft pt-4 text-sm leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
    </section>
  );
}

function StatusTile({
  tone,
  label,
  count,
}: {
  tone: "identified" | "preparing" | "missing";
  label: string;
  count: number;
}) {
  const color = {
    identified: "var(--color-st-identified)",
    preparing: "var(--color-st-preparing)",
    missing: "var(--color-st-missing)",
  }[tone];

  return (
    <div className="min-w-[130px] border border-edge bg-surface px-5 py-3.5">
      <p className="tech mb-2" style={{ color }}>
        {label}
      </p>
      <p className="tabular font-display text-2xl leading-none text-title">{count}</p>
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
  const counts = statusCounts(assets);

  return (
    <div className="flex flex-col gap-px">
      <header className="flex flex-wrap items-end justify-between gap-8 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl">
            {assets.length} {assets.length === 1 ? "ativo" : "ativos"}, {institutions.length}{" "}
            {institutions.length === 1 ? "instituição" : "instituições"}
          </h1>
          <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-aux">
            A lista está organizada por valor declarado, não por desempenho. Abra o verbete de
            qualquer tipo de ativo para descer à explicação.
          </p>
          <p className="mt-4 font-mono text-sm text-tertiary">
            TOTAL DECLARADO ·{" "}
            <span className="tabular text-title">{formatCents(total)}</span>
          </p>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
            Soma do que você informou. Não calculamos rendimento nem atualizamos cotação.
          </p>
        </div>

        {assets.length > 0 ? (
          <div className="flex flex-wrap gap-px">
            <StatusTile tone="identified" label="Identificados" count={counts.identified} />
            <StatusTile tone="preparing" label="A confirmar" count={counts.preparing} />
            <StatusTile tone="missing" label="Não classificados" count={counts.missing} />
          </div>
        ) : null}
      </header>

      {pending.length > 0 ? (
        <section className="border border-[#3A3A2A] bg-[#0E1416] p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-xl text-title">Confirme a classificação</h2>
            <StatusPill tone="attention" label="AÇÃO NECESSÁRIA" />
          </div>
          <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-aux">
            Não identificamos com segurança o tipo destes ativos pelo nome e pelo CNPJ
            informados. Preferimos perguntar a exibir um verbete que pode não corresponder ao
            que você tem.
          </p>

          <ul className="mt-6 flex flex-col gap-4">
            {pending.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-4 border-t border-edge-soft pt-4"
              >
                <span className="text-base text-title">{asset.name}</span>
                <form action={confirmClassAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={asset.id} />
                  <label htmlFor={`class-${asset.id}`} className="sr-only">
                    Classe de {asset.name}
                  </label>
                  <select
                    id={`class-${asset.id}`}
                    name="assetClass"
                    defaultValue={asset.assetClass}
                    className="border border-edge bg-inset px-3 py-2 text-sm text-body"
                  >
                    {ASSET_CLASSES.filter((c) => c !== "NAO_CLASSIFICADO").map((assetClass) => (
                      <option key={assetClass} value={assetClass}>
                        {profileFor(assetClass).label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-light px-4 py-2 text-sm font-semibold text-[#060D10] transition-colors duration-200 hover:bg-[#F0D9B4]"
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
        <div className="border border-edge bg-surface p-10 text-center">
          <h2 className="text-2xl">Sua carteira está vazia</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-aux">
            Adicione o primeiro ativo com nome, valor e — quando houver — CNPJ e instituição. A
            leitura por estrutura, instituição, cobertura do FGC e vencimentos aparece assim que
            existir algo para organizar.
          </p>
        </div>
      ) : (
        <>
          <section className="border border-edge bg-surface">
            <h2 className="sr-only">Ativos declarados</h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-edge-soft">
                    <th scope="col" className="tech px-6 py-3 font-normal text-muted">
                      Ativo
                    </th>
                    <th scope="col" className="tech px-6 py-3 font-normal text-muted">
                      Estrutura
                    </th>
                    <th scope="col" className="tech px-6 py-3 font-normal text-muted">
                      Instituição
                    </th>
                    <th scope="col" className="tech px-6 py-3 text-right font-normal text-muted">
                      Valor declarado
                    </th>
                    <th scope="col" className="tech px-6 py-3 text-right font-normal text-muted">
                      Verbete
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const profile = profileFor(asset.assetClass);
                    const status = identificationStatus(asset);

                    return (
                      <tr key={asset.id} className="border-b border-[#101B20] last:border-0">
                        <td className="px-6 py-4 text-base text-title">{asset.name}</td>
                        <td className="px-6 py-4 text-base text-aux">
                          <Link
                            href={`/ativos/${asset.assetClass}`}
                            className="border-b border-light/30 text-light transition-colors hover:border-light"
                          >
                            {profile.label}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-base text-aux">
                          {asset.institution ?? "—"}
                        </td>
                        <td className="tabular whitespace-nowrap px-6 py-4 text-right font-mono text-sm text-title">
                          {formatCents(asset.valueCents)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusPill tone={status.tone} label={status.label} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <form action={deleteAssetAction}>
                            <input type="hidden" name="id" value={asset.id} />
                            <button
                              type="submit"
                              className="border border-edge px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-tertiary transition-colors duration-200 hover:border-st-missing/60 hover:text-st-missing"
                            >
                              Remover
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-px lg:grid-cols-2">
            <Panel
              title="Composição por classe"
              note="Agrupamento por tipo de estrutura. Não indica concentração adequada ou inadequada."
            >
              <CategoryBars slices={categories} />
            </Panel>

            <Panel
              title="Composição por instituição"
              note="A cobertura do FGC é contada por CPF e por instituição, por isso esta leitura aparece separada."
            >
              <InstitutionBars slices={institutions} />
            </Panel>
          </div>

          <div className="grid gap-px lg:grid-cols-2">
            <Panel
              title="Cobertura do FGC"
              note={
                <>
                  Considera apenas ativos de tipos cobertos (CDB, LCI, LCA, LC e poupança).
                  Limite vigente considerado: {formatCents(FGC_LIMIT_PER_INSTITUTION_CENTS)} por
                  CPF e por instituição, com teto global por período. Confirme em{" "}
                  <a
                    href="https://www.fgc.org.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-light/30 text-light hover:border-light"
                  >
                    fgc.org.br
                  </a>
                  .
                </>
              }
            >
              {fgc.length === 0 ? (
                <p className="text-base text-aux">
                  Nenhum ativo de tipo coberto pelo FGC na sua carteira.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {fgc.map((entry) => (
                    <li
                      key={entry.institution}
                      className="border-b border-edge-soft pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-base text-title">{entry.institution}</span>
                        <span className="tabular font-mono text-sm text-title">
                          {formatCents(entry.coveredValueCents)}
                        </span>
                      </div>
                      <div className="mt-2">
                        {entry.aboveLimitCents > 0 ? (
                          <StatusPill
                            tone="attention"
                            label={`${formatCents(entry.aboveLimitCents)} ACIMA DO LIMITE`}
                          />
                        ) : (
                          <StatusPill tone="identified" label="DENTRO DO LIMITE" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Calendário de vencimentos"
              note="Datas conforme informadas por você. Ativos sem vencimento, como ações e fundos abertos, não aparecem aqui."
            >
              {maturities.length === 0 ? (
                <p className="text-base text-aux">
                  Nenhum ativo com data de vencimento informada.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {maturities.map((entry) => (
                    <li
                      key={entry.asset.id}
                      className="flex flex-wrap items-baseline justify-between gap-3 border-b border-edge-soft pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-base text-title">{entry.asset.name}</span>
                      <span className="tabular font-mono text-sm text-tertiary">
                        {dateFormatter.format(entry.maturityDate)}
                        <span className="ml-3 text-muted">
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
            </Panel>
          </div>
        </>
      )}

      <Panel title="Adicionar ativo">
        <div className="max-w-xl">
          <AssetForm />
        </div>
      </Panel>
    </div>
  );
}
