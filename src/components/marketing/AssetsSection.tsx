"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { StatusPill } from "@/components/ui/StatusPill";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { profileFor, TAX_NOTICE, CATALOG_REVIEWED_AT } from "@/domain/assets/profiles";
import type { AssetClass } from "@/domain/assets/taxonomy";

/**
 * "Zona iluminada · o mesmo ativo, descrito".
 *
 * A unidade de entrega do produto: um verbete por tipo de ativo. As fichas vêm
 * do mesmo catálogo que alimenta a área autenticada — não há cópia de texto
 * para a landing, então o guardrail de conformidade cobre também esta seção.
 */
const SHOWCASE: readonly AssetClass[] = [
  "CDB",
  "LCI",
  "TESOURO_DIRETO",
  "FII",
  "ACAO",
  "DEBENTURE",
  "CRI",
  "PREVIDENCIA",
];

/** A garantia é fato estrutural do instrumento, então vira rótulo de estado. */
const GUARANTEE_LABEL: Record<string, string> = {
  FGC: "COBERTO PELO FGC",
  TESOURO_NACIONAL: "TESOURO NACIONAL",
  GARANTIA_REAL: "GARANTIA DA EMISSÃO",
  SEM_GARANTIA_ESPECIFICA: "SEM COBERTURA DO FGC",
};

function FichaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-5 border-b border-[#142A32] py-2.5 last:border-0">
      <span className="shrink-0 text-sm text-tertiary">{label}</span>
      <span className="text-right text-sm text-body">{children}</span>
    </div>
  );
}

export function AssetsSection() {
  const [selected, setSelected] = useState<AssetClass>("CDB");
  const prefersReducedMotion = useReducedMotion();
  const profile = profileFor(selected);

  return (
    <Section
      id="ativos"
      depth="surface"
      eyebrow="Zona iluminada · o mesmo ativo, descrito"
      title="Um verbete por tipo de ativo."
      description={
        <p>
          Escrito em segunda pessoa, sem juízo de valor. O que o ativo é, quem emite, como
          funciona o resgate, qual a tributação e qual a estrutura de garantia — com a fonte
          oficial ao lado de cada afirmação.
        </p>
      }
    >
      <Reveal>
        <div role="tablist" aria-label="Tipos de ativo" className="flex flex-wrap gap-2.5">
          {SHOWCASE.map((assetClass) => {
            const isSelected = assetClass === selected;
            return (
              <button
                key={assetClass}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls="verbete"
                onClick={() => setSelected(assetClass)}
                className={`px-4 py-2 text-sm transition-colors duration-200 ${
                  isSelected
                    ? "bg-light font-semibold text-[#060D10]"
                    : "border border-edge text-body hover:border-light/60 hover:text-light"
                }`}
              >
                {profileFor(assetClass).label}
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <AnimatePresence mode="wait">
          <motion.article
            key={selected}
            id="verbete"
            role="tabpanel"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 border border-edge bg-surface"
          >
            <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#142A32] p-7 sm:p-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-light">
                  {profile.label} · nível 3 · estrutura
                </p>
                <h3 className="mt-3 text-2xl sm:text-3xl">{profile.fullName}</h3>
                <p className="mt-2 max-w-[60ch] text-base text-aux">{profile.summary}</p>
              </div>
              <StatusPill
                tone={profile.guarantee.kind === "SEM_GARANTIA_ESPECIFICA" ? "unavailable" : "identified"}
                label={GUARANTEE_LABEL[profile.guarantee.kind] ?? "GARANTIA"}
              />
            </header>

            <div className="grid lg:grid-cols-[1.5fr_340px]">
              <div className="p-7 sm:p-8">
                <p className="max-w-[62ch] text-lg leading-[1.7] text-body">{profile.whatItIs}</p>

                <p className="mt-5 max-w-[62ch] text-lg leading-[1.7] text-body">
                  {profile.liquidity}
                </p>

                <div className="mt-7 flex flex-wrap gap-2.5">
                  {profile.officialSources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-[#1D3A44] px-3.5 py-2.5 font-mono text-xs text-light transition-colors duration-200 hover:border-light/70"
                    >
                      {source.label} ↗
                    </a>
                  ))}
                </div>
              </div>

              <aside className="border-t border-[#142A32] bg-[#091A20] p-7 sm:p-8 lg:border-l lg:border-t-0">
                <p className="tech mb-4 text-tertiary">Ficha</p>

                <div>
                  <FichaRow label="Quem emite">{profile.issuedBy}</FichaRow>
                  <FichaRow label="Tributação">{profile.taxation}</FichaRow>
                  <FichaRow label="Garantia">{profile.guarantee.description}</FichaRow>
                </div>

                <p className="mt-5 border-t border-[#142A32] pt-4 text-sm leading-relaxed text-muted">
                  {TAX_NOTICE}
                </p>
                <p className="mt-3 font-mono text-[11px] text-muted">
                  Verbete revisado em {CATALOG_REVIEWED_AT}
                </p>
              </aside>
            </div>
          </motion.article>
        </AnimatePresence>
      </Reveal>
    </Section>
  );
}
