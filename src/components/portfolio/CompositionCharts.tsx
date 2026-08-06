import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/domain/assets/taxonomy";
import type { CategorySlice, InstitutionSlice } from "@/domain/portfolio/analysis";
import { formatCents } from "@/domain/portfolio/money";

/**
 * Composição em barras, por VALOR DECLARADO.
 *
 * Divergência deliberada do arquivo de design, decidida com o cliente: o design
 * compõe por contagem de ativos ("Securitização · 7") e diz explicitamente que
 * não é alocação por valor. Aqui a barra é a participação do valor que o
 * usuário declarou, com a contagem como informação secundária embaixo.
 *
 * O motivo é que somar valores que o próprio usuário informou continua sendo
 * aritmética sobre os dados dele — descrição, não avaliação. A ressalva de que
 * isso não indica concentração adequada ou inadequada acompanha o painel.
 *
 * Não troque para contagem sem falar com o cliente: a escolha é de produto.
 *
 * Componentes de servidor, sem animação: aqui o gráfico mostra dado real e a
 * prioridade é aparecer pronto no primeiro render. A versão animada existe só
 * na landing, onde o dado é ilustrativo.
 *
 * Cada barra vem sempre acompanhada de rótulo e valor — nenhuma informação do
 * sistema depende só de cor.
 */

function Bar({
  label,
  share,
  valueCents,
  color,
  meta,
}: {
  label: string;
  share: number;
  valueCents: number;
  color: string;
  meta?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-4">
        <span className="text-base text-body">{label}</span>
        <span className="tabular whitespace-nowrap font-mono text-sm text-tertiary">
          {share}% · {formatCents(valueCents)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-shallow">
        <div
          className="h-1.5"
          style={{ width: `${Math.max(share, 0.6)}%`, backgroundColor: color }}
        />
      </div>
      {meta ? <p className="mt-1.5 font-mono text-[11px] text-muted">{meta}</p> : null}
    </div>
  );
}

export function CategoryBars({ slices }: { slices: readonly CategorySlice[] }) {
  return (
    <div className="flex flex-col gap-5">
      {slices.map((slice) => (
        <Bar
          key={slice.category}
          label={CATEGORY_LABELS[slice.category]}
          share={slice.share}
          valueCents={slice.valueCents}
          color={CATEGORY_COLORS[slice.category]}
          meta={`${slice.assetCount} ${slice.assetCount === 1 ? "ativo" : "ativos"}`}
        />
      ))}
    </div>
  );
}

export function InstitutionBars({ slices }: { slices: readonly InstitutionSlice[] }) {
  return (
    <div className="flex flex-col gap-5">
      {slices.map((slice) => (
        <Bar
          key={slice.institution}
          label={slice.institution}
          share={slice.share}
          valueCents={slice.valueCents}
          color="#8FBCC2"
          meta={`${slice.assetCount} ${slice.assetCount === 1 ? "ativo" : "ativos"}`}
        />
      ))}
    </div>
  );
}
