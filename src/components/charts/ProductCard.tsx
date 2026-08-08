/**
 * Um produto, em quatro respostas.
 *
 * A versão anterior desta página empilhava parágrafos: o leitor precisava
 * atravessar o texto inteiro para descobrir se aquele produto tem cobertura do
 * FGC. Aqui as quatro perguntas que sempre se repetem — para onde vai, qual a
 * garantia, quando sai o dinheiro, como é o imposto — ficam sempre no mesmo
 * lugar, na mesma ordem, em todos os produtos. O que muda é a resposta.
 *
 * A grade não ordena e não pontua: os produtos aparecem na ordem do catálogo, e
 * nenhum campo carrega adjetivo de mérito. Um cartão só resume; a explicação
 * inteira está no verbete, a um clique.
 */

import Link from "next/link";

import { GuaranteeMark } from "@/components/charts/GuaranteeMark";
import { familyOf } from "@/domain/assets/families";
import { profileFor } from "@/domain/assets/profiles";
import type { AssetClass } from "@/domain/assets/taxonomy";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-t border-edge-soft py-3">
      <dt className="font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-aux">{children}</dd>
    </div>
  );
}

export function ProductCard({
  assetClass,
  accent = "var(--color-light)",
}: {
  assetClass: AssetClass;
  accent?: string;
}) {
  const profile = profileFor(assetClass);
  const family = familyOf(assetClass);

  return (
    <article className="group flex h-full flex-col border border-edge bg-surface/60 p-7 transition-colors duration-500 hover:border-light/40 hover:bg-surface">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em]" style={{ color: accent }}>
            {profile.label}
          </p>
          <h3 className="mt-3 text-xl leading-tight">{profile.fullName}</h3>
        </div>
        <GuaranteeMark kind={profile.guarantee.kind} />
      </div>

      <p className="mt-5 text-base leading-relaxed text-body">{profile.summary}</p>

      <dl className="mt-6">
        <Row label="Destino">{family?.destino ?? "—"}</Row>
        <Row label="Resgate">{profile.liquidityTag}</Row>
        <Row label="Imposto">{profile.taxTag}</Row>
      </dl>

      <div className="mt-auto pt-6">
        <Link
          href={`/produtos/${assetClass}`}
          className="inline-flex items-center gap-2 border-b border-light/30 pb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-light transition-colors duration-300 hover:border-light"
        >
          Ver a ficha completa
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
