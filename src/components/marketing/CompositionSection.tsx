"use client";

import { motion, useReducedMotion } from "motion/react";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { CATEGORY_COLORS, CATEGORY_LABELS, type AssetCategory } from "@/domain/assets/taxonomy";
import { donutSegments } from "@/domain/portfolio/donut";

/**
 * Dados meramente ilustrativos.
 *
 * Uma carteira de exemplo, com percentuais redondos e sem nome de instituição
 * real, existe só para demonstrar o formato da leitura. Nada aqui vem de dado
 * de usuário nem representa carteira de ninguém — e a interface diz isso em
 * texto visível, não só em comentário de código.
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

const RADIUS = 84;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Respiro entre fatias, em unidades de contorno do SVG.
 *
 * Duas categorias vizinhas da paleta — renda fixa e fundos — são ambas azuis, e
 * encostadas uma na outra liam como um bloco contínuo. O vão resolve isso sem
 * mexer nas cores da marca, que é a solução preferível: a paleta é dada, a
 * separação é decisão de desenho de gráfico.
 */
const SEGMENT_GAP = 3;

/**
 * Calculado no escopo do módulo porque depende só de constantes: roda uma vez
 * na carga em vez de a cada render. A geometria em si é a mesma do painel, e
 * vem do domínio para que os dois não divirjam.
 */
const DONUT_SEGMENTS = donutSegments(
  EXAMPLE_COMPOSITION,
  (slice) => slice.share,
  CIRCUMFERENCE,
  SEGMENT_GAP,
);

function DonutChart() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 240 240"
      role="img"
      aria-label="Exemplo ilustrativo de composição de carteira por classe de ativo."
      className="w-full max-w-[280px]"
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
        {DONUT_SEGMENTS.map((segment, index) => (
          <motion.circle
            key={segment.item.category}
            cx="120"
            cy="120"
            r={RADIUS}
            fill="none"
            stroke={CATEGORY_COLORS[segment.item.category]}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDashoffset={-segment.offset}
            initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
            whileInView={{ strokeDasharray: `${segment.length} ${CIRCUMFERENCE}` }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 1.1,
              delay: prefersReducedMotion ? 0 : 0.15 + index * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </g>
    </svg>
  );
}

function CategoryLegend() {
  return (
    <ul className="space-y-4">
      {EXAMPLE_COMPOSITION.map((slice, index) => (
        <Reveal as="li" key={slice.category} delay={index * 0.07}>
          <div className="flex items-center justify-between gap-6 border-b border-blue/20 pb-3">
            <span className="flex items-center gap-3 text-sm text-mist">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[slice.category] }}
              />
              {CATEGORY_LABELS[slice.category]}
            </span>
            <span className="font-serif text-lg text-blue-200">{slice.share}%</span>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

function InstitutionBars() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <ul className="space-y-6">
      {EXAMPLE_INSTITUTIONS.map((item, index) => (
        <li key={item.label}>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm text-mist">{item.label}</span>
            <span className="font-serif text-base text-blue-200">{item.share}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue to-gold"
              initial={{ width: 0 }}
              whileInView={{ width: `${item.share}%` }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 1,
                delay: prefersReducedMotion ? 0 : index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CompositionSection() {
  return (
    <Section
      id="composicao"
      eyebrow="Composição"
      title={
        <>
          Onde o seu dinheiro está,
          <br />
          <span className="text-blue-200">em uma imagem só.</span>
        </>
      }
      description={
        <p>
          Depois que você informa nome, CNPJ e valor de cada ativo, a carteira é
          organizada por classe e por instituição. É a mesma informação que você já
          tem espalhada por vários aplicativos, reunida em uma leitura só.
        </p>
      }
    >
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="surface rounded-2xl p-8 sm:p-10">
          <h3 className="mb-8 text-sm font-medium uppercase tracking-[0.18em] text-gold">
            Por classe de ativo
          </h3>
          <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start">
            <DonutChart />
            <div className="w-full">
              <CategoryLegend />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="surface rounded-2xl p-8 sm:p-10">
          <h3 className="mb-8 text-sm font-medium uppercase tracking-[0.18em] text-gold">
            Por instituição
          </h3>
          <InstitutionBars />
          <p className="mt-10 text-sm leading-relaxed text-blue-200">
            Ver a concentração por instituição importa porque a cobertura do FGC é
            contada por CPF e por instituição. A seção de Segurança e Estrutura
            detalha como isso aparece na sua leitura.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <p className="mt-10 text-xs text-blue-200/60">
          Números meramente ilustrativos, usados para demonstrar o formato da leitura.
          Não representam a carteira de nenhum cliente.
        </p>
      </Reveal>
    </Section>
  );
}
