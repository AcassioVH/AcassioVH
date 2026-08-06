"use client";

import { motion, useReducedMotion } from "motion/react";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { CATEGORY_COLORS, CATEGORY_LABELS, type AssetCategory } from "@/domain/assets/taxonomy";

/**
 * Composição da carteira, no formato do sistema: barras horizontais.
 *
 * Barras e não rosca porque a comparação aqui é entre grandezas, e barra
 * alinhada numa linha de base comum é mais fácil de comparar que arco. A rosca
 * ficava mais bonita e dizia menos.
 *
 * Os números são ilustrativos e a seção diz isso em texto visível.
 */
const EXAMPLE_COMPOSITION: readonly { category: AssetCategory; share: number }[] = [
  { category: "RENDA_FIXA", share: 42 },
  { category: "FUNDOS", share: 26 },
  { category: "RENDA_VARIAVEL", share: 18 },
  { category: "PREVIDENCIA", share: 9 },
  { category: "ESTRUTURADO", share: 5 },
];

const EXAMPLE_INSTITUTIONS: readonly { label: string; share: number }[] = [
  { label: "Instituição A", share: 38 },
  { label: "Instituição B", share: 27 },
  { label: "Instituição C", share: 21 },
  { label: "Instituição D", share: 14 },
];

function Bar({
  label,
  share,
  color,
  index,
}: {
  label: string;
  share: number;
  color: string;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-4">
        <span className="text-base text-body">{label}</span>
        <span className="tabular font-mono text-sm text-tertiary">{share}%</span>
      </div>
      <div className="h-1.5 w-full bg-shallow">
        <motion.div
          className="h-1.5"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${share}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.9,
            delay: prefersReducedMotion ? 0 : index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>
    </div>
  );
}

export function CompositionSection() {
  return (
    <Section
      id="composicao"
      depth="deep"
      eyebrow="Nível 3 · estrutura e ordem"
      aside="Não indica concentração adequada ou inadequada."
      title="A carteira organizada por estrutura e por instituição."
      description={
        <p>
          Depois que você informa nome, valor e — quando houver — CNPJ e instituição, a carteira
          é agrupada. Somar e agrupar são operações sobre os seus próprios números; a leitura do
          que isso significa continua sua.
        </p>
      }
    >
      <div className="grid gap-px lg:grid-cols-2">
        <Reveal>
          <div className="h-full border border-edge bg-surface p-7 sm:p-8">
            <p className="tech mb-6 text-tertiary">Por classe de ativo</p>
            <div className="flex flex-col gap-5">
              {EXAMPLE_COMPOSITION.map((slice, index) => (
                <Bar
                  key={slice.category}
                  label={CATEGORY_LABELS[slice.category]}
                  share={slice.share}
                  color={CATEGORY_COLORS[slice.category]}
                  index={index}
                />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="h-full border border-edge bg-surface p-7 sm:p-8">
            <p className="tech mb-6 text-tertiary">Por instituição</p>
            <div className="flex flex-col gap-5">
              {EXAMPLE_INSTITUTIONS.map((item, index) => (
                <Bar
                  key={item.label}
                  label={item.label}
                  share={item.share}
                  color="#8FBCC2"
                  index={index}
                />
              ))}
            </div>
            <p className="mt-7 border-t border-edge-soft pt-5 text-sm leading-relaxed text-tertiary">
              A cobertura do FGC é contada por CPF e por instituição, por isso a distribuição
              entre instituições aparece separada da distribuição por classe.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.18}>
        <p className="mt-6 font-mono text-[11px] leading-relaxed text-muted">
          Números ilustrativos, para demonstrar o formato da leitura. Não representam a carteira
          de nenhum cliente.
        </p>
      </Reveal>
    </Section>
  );
}
