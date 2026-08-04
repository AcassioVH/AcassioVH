import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/domain/assets/taxonomy";
import type { CategorySlice, InstitutionSlice } from "@/domain/portfolio/analysis";
import { donutSegments } from "@/domain/portfolio/donut";
import { formatCents } from "@/domain/portfolio/money";

const RADIUS = 84;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Mesmo respiro do gráfico da landing: separa fatias de tons vizinhos. */
const SEGMENT_GAP = 3;

/**
 * Rosca de composição por categoria.
 *
 * Componente de servidor e sem animação: aqui o gráfico mostra dado real do
 * usuário, e a prioridade é aparecer pronto no primeiro render. A versão
 * animada existe só na landing, onde o dado é ilustrativo.
 */
export function CategoryDonut({ slices }: { slices: readonly CategorySlice[] }) {
  const segments = donutSegments(
    slices,
    (slice) => slice.share,
    CIRCUMFERENCE,
    SEGMENT_GAP,
  );

  return (
    <svg
      viewBox="0 0 240 240"
      role="img"
      aria-label={`Composição por classe: ${slices
        .map((slice) => `${CATEGORY_LABELS[slice.category]} ${slice.share}%`)
        .join(", ")}.`}
      className="w-full max-w-[240px]"
    >
      <g transform="rotate(-90 120 120)">
        <circle
          cx="120"
          cy="120"
          r={RADIUS}
          fill="none"
          stroke="#16345c"
          strokeWidth={STROKE}
          opacity={0.5}
        />
        {segments.map((segment) => (
          <circle
            key={segment.item.category}
            cx="120"
            cy="120"
            r={RADIUS}
            fill="none"
            stroke={CATEGORY_COLORS[segment.item.category]}
            strokeWidth={STROKE}
            strokeDasharray={`${segment.length} ${CIRCUMFERENCE}`}
            strokeDashoffset={-segment.offset}
          />
        ))}
      </g>
    </svg>
  );
}

export function CategoryLegend({ slices }: { slices: readonly CategorySlice[] }) {
  return (
    <ul className="w-full space-y-3">
      {slices.map((slice) => (
        <li
          key={slice.category}
          className="flex items-center justify-between gap-4 border-b border-blue/20 pb-3"
        >
          <span className="flex items-center gap-3 text-sm text-mist">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[slice.category] }}
            />
            {CATEGORY_LABELS[slice.category]}
          </span>
          <span className="text-right">
            <span className="block font-serif text-base text-mist">{slice.share}%</span>
            <span className="block text-xs text-blue-200/70">
              {formatCents(slice.valueCents)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function InstitutionBars({ slices }: { slices: readonly InstitutionSlice[] }) {
  return (
    <ul className="space-y-5">
      {slices.map((slice) => (
        <li key={slice.institution}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="text-sm text-mist">{slice.institution}</span>
            <span className="text-right text-sm text-blue-200">
              {slice.share}% · {formatCents(slice.valueCents)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue to-gold"
              style={{ width: `${Math.max(slice.share, 1)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
