"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { Disclaimer } from "@/components/ui/Disclaimer";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { profileFor, TAX_NOTICE } from "@/domain/assets/profiles";
import type { AssetClass } from "@/domain/assets/taxonomy";

/**
 * As fichas exibidas aqui vêm do mesmo catálogo que alimenta o produto — não há
 * cópia de texto para a landing. Isso significa que o teste de conformidade
 * cobre também o que aparece nesta seção.
 */
const SHOWCASE: readonly AssetClass[] = [
  "CDB",
  "LCI",
  "TESOURO_DIRETO",
  "FII",
  "ACAO",
  "DEBENTURE",
  "PREVIDENCIA",
  "COE",
];

const GUARANTEE_LABELS: Record<string, string> = {
  FGC: "Cobertura do FGC",
  TESOURO_NACIONAL: "Tesouro Nacional",
  GARANTIA_REAL: "Garantias da própria emissão",
  SEM_GARANTIA_ESPECIFICA: "Sem cobertura do FGC",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-gold">{label}</dt>
      <dd className="text-sm leading-relaxed text-blue-200">{children}</dd>
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
      eyebrow="Ativos explicados"
      title={
        <>
          Cada ativo com uma ficha
          <br />
          <span className="text-blue-200">que explica o tipo, não o palpite.</span>
        </>
      }
      description={
        <p>
          Para cada classe existe uma ficha curada: o que é, quem emite, como funciona a
          liquidez, como é a tributação e qual é a estrutura de garantia. Para
          rentabilidade, a ficha te leva direto à fonte oficial — assim o número que
          você vê é o número de quem tem autoridade para publicá-lo.
        </p>
      }
    >
      <Reveal>
        <div
          role="tablist"
          aria-label="Classes de ativo"
          className="flex flex-wrap gap-2.5 border-b border-blue/25 pb-8"
        >
          {SHOWCASE.map((assetClass) => {
            const isSelected = assetClass === selected;
            return (
              <button
                key={assetClass}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls="ficha-ativo"
                onClick={() => setSelected(assetClass)}
                className={`rounded-full px-5 py-2 text-sm transition-colors duration-300 ${
                  isSelected
                    ? "bg-gold font-semibold text-navy"
                    : "border border-blue-200/25 text-blue-200 hover:border-gold/50 hover:text-gold"
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
          <motion.div
            key={selected}
            id="ficha-ativo"
            role="tabpanel"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="surface mt-10 rounded-2xl p-8 sm:p-12"
          >
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl">{profile.fullName}</h3>
                <p className="mt-2 text-sm text-blue-200">{profile.summary}</p>
              </div>
              <span className="rounded-full border border-gold/35 px-4 py-1.5 text-xs text-gold">
                {GUARANTEE_LABELS[profile.guarantee.kind] ?? "Garantia"}
              </span>
            </div>

            <p className="mb-10 max-w-3xl leading-relaxed text-mist/90">{profile.whatItIs}</p>

            <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Quem emite">{profile.issuedBy}</Field>
              <Field label="Liquidez">{profile.liquidity}</Field>
              <Field label="Tributação">
                {profile.taxation}
                <span className="mt-2 block text-blue-200/60">{TAX_NOTICE}</span>
              </Field>
              <Field label="Garantia">{profile.guarantee.description}</Field>
              <Field label="Características">
                <ul className="space-y-2">
                  {profile.characteristics.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Field>
              <Field label="Conferir na fonte oficial">
                <ul className="space-y-3">
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
                      <span className="block text-blue-200/70">{source.whatYouFindThere}</span>
                    </li>
                  ))}
                </ul>
              </Field>
            </dl>

            <Disclaimer className="mt-10 border-t border-blue/20 pt-6" />
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </Section>
  );
}
