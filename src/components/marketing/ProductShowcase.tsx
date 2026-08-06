"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { StatusPill } from "@/components/ui/StatusPill";
import { CATALOGUED_CLASSES, familyOf } from "@/domain/assets/families";
import { CATALOG_REVIEWED_AT, TAX_NOTICE, profileFor } from "@/domain/assets/profiles";
import type { AssetClass } from "@/domain/assets/taxonomy";

/**
 * O verbete, lido dentro da página.
 *
 * A unidade de entrega do conteúdo: um texto por tipo de produto, em segunda
 * pessoa, sem juízo de valor. A troca entre produtos acontece sem recarregar,
 * para que comparar dois deles seja uma questão de dois cliques.
 */

const GUARANTEE_LABEL: Record<string, string> = {
  FGC: "COBERTO PELO FGC",
  TESOURO_NACIONAL: "TESOURO NACIONAL",
  GARANTIA_REAL: "GARANTIA DA EMISSÃO",
  SEM_GARANTIA_ESPECIFICA: "SEM COBERTURA DO FGC",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-edge-soft pt-5">
      <h4 className="tech mb-2.5 text-tertiary">{label}</h4>
      <p className="text-base leading-relaxed text-aux">{children}</p>
    </div>
  );
}

export function ProductShowcase() {
  const [selected, setSelected] = useState<AssetClass>("CDB");
  const still = useReducedMotion();
  const profile = profileFor(selected);
  const family = familyOf(selected);

  return (
    <section
      id="produtos"
      data-depth="3"
      aria-labelledby="produtos-title"
      className="relative border-t border-edge-soft bg-deep px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="beam absolute inset-x-0 top-0 h-px" aria-hidden="true" />

      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="tech text-amber">Zona iluminada · um verbete por produto</p>
          <h2
            id="produtos-title"
            className="mt-6 max-w-[18ch] text-[clamp(2rem,5vw,3.4rem)] leading-[1.04]"
          >
            O mesmo nome, agora inteiro.
          </h2>
          <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-aux">
            Escolha um produto. O texto descreve a estrutura, a origem dos pagamentos, a
            liquidez, a tributação e a garantia — e aponta a fonte oficial de cada dado que
            não cabe a nós afirmar.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            role="tablist"
            aria-label="Produtos de investimento"
            className="mt-12 flex flex-wrap gap-2"
          >
            {CATALOGUED_CLASSES.map((assetClass) => {
              const isSelected = assetClass === selected;
              return (
                <button
                  key={assetClass}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  aria-controls="verbete"
                  onClick={() => setSelected(assetClass)}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-all duration-300 ${
                    isSelected
                      ? "bg-light text-[#060d10]"
                      : "border border-edge text-tertiary hover:border-light/60 hover:text-light"
                  }`}
                >
                  {profileFor(assetClass).label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.article
            key={selected}
            id="verbete"
            role="tabpanel"
            initial={still ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={still ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: still ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 border border-edge bg-surface"
          >
            <header className="flex flex-wrap items-start justify-between gap-6 border-b border-edge-soft p-8 sm:p-10">
              <div>
                {family ? (
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-light">
                    {family.label} · paga você: {family.whoPays}
                  </p>
                ) : null}
                <h3 className="mt-4 text-[clamp(1.7rem,3.5vw,2.6rem)] leading-[1.1]">
                  {profile.fullName}
                </h3>
                <p className="mt-3 max-w-[56ch] text-lg text-aux">{profile.summary}</p>
              </div>

              <StatusPill
                tone={
                  profile.guarantee.kind === "SEM_GARANTIA_ESPECIFICA"
                    ? "unavailable"
                    : "identified"
                }
                label={GUARANTEE_LABEL[profile.guarantee.kind] ?? "GARANTIA"}
              />
            </header>

            <div className="grid lg:grid-cols-[1.35fr_1fr]">
              <div className="p-8 sm:p-10">
                <p className="max-w-[62ch] text-lg leading-[1.8] text-body">
                  {profile.whatItIs}
                </p>

                <div className="mt-10 grid gap-7 sm:grid-cols-2">
                  <Field label="Quem emite">{profile.issuedBy}</Field>
                  <Field label="Liquidez">{profile.liquidity}</Field>
                  <Field label="Tributação">
                    {profile.taxation}
                    <span className="mt-2 block text-sm text-muted">{TAX_NOTICE}</span>
                  </Field>
                  <Field label="Garantia">{profile.guarantee.description}</Field>
                </div>

                <Link
                  href={`/produtos/${selected}`}
                  className="mt-10 inline-block border-b border-light/40 pb-1 text-base text-light transition-colors duration-300 hover:border-light"
                >
                  Abrir o verbete completo →
                </Link>
              </div>

              <aside className="border-t border-edge-soft bg-inset p-8 sm:p-10 lg:border-l lg:border-t-0">
                <h4 className="tech mb-5 text-tertiary">Características da estrutura</h4>
                <ul className="space-y-4">
                  {profile.characteristics.map((item) => (
                    <li key={item} className="flex gap-3 text-base leading-relaxed text-aux">
                      <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 bg-amber" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-9 border-t border-edge-soft pt-6">
                  <h4 className="tech mb-3 text-light">Nível 4 · onde conferir</h4>
                  <p className="mb-5 text-sm leading-relaxed text-muted">
                    Rentabilidade, cotação e limites vigentes não são afirmados aqui.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.officialSources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-edge px-3 py-2 font-mono text-[11px] text-light transition-colors duration-300 hover:border-light"
                      >
                        {source.label} ↗
                      </a>
                    ))}
                  </div>
                  <p className="mt-6 font-mono text-[11px] text-muted">
                    Verbete revisado em {CATALOG_REVIEWED_AT}
                  </p>
                </div>
              </aside>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
}
