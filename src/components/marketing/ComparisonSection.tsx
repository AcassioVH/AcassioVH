"use client";

import { useState } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { CATALOGUED_CLASSES, familyOf } from "@/domain/assets/families";
import { profileFor } from "@/domain/assets/profiles";
import type { AssetClass } from "@/domain/assets/taxonomy";

/**
 * Comparação de estruturas, lado a lado.
 *
 * Aqui mora uma linha fina que vale enunciar. Comparar **tipos de produto** por
 * características verificáveis — quem paga, se há cobertura do FGC, como é o
 * resgate, qual a regra tributária — é descrição, e é exatamente o que um
 * material educativo faz.
 *
 * O que este componente NÃO faz, por decisão: não ordena, não pontua, não
 * conclui qual é preferível e não sugere adequação a perfil. Nenhuma célula
 * carrega juízo; todas carregam fato. A ausência de uma coluna "veredito" é o
 * mecanismo.
 */

const GUARANTEE_SHORT: Record<string, string> = {
  FGC: "Cobertura do FGC",
  TESOURO_NACIONAL: "Tesouro Nacional",
  GARANTIA_REAL: "Garantias da emissão",
  SEM_GARANTIA_ESPECIFICA: "Sem cobertura do FGC",
};

const ROWS = [
  {
    label: "Quem paga você",
    value: (c: AssetClass) => familyOf(c)?.whoPays ?? "—",
  },
  { label: "Quem emite", value: (c: AssetClass) => profileFor(c).issuedBy },
  {
    label: "Garantia",
    value: (c: AssetClass) => GUARANTEE_SHORT[profileFor(c).guarantee.kind] ?? "—",
  },
  { label: "Liquidez", value: (c: AssetClass) => profileFor(c).liquidity },
  { label: "Tributação", value: (c: AssetClass) => profileFor(c).taxation },
] as const;

function Picker({
  value,
  onChange,
  label,
}: {
  value: AssetClass;
  onChange: (next: AssetClass) => void;
  label: string;
}) {
  const id = `cmp-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="tech mb-2 block text-tertiary">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as AssetClass)}
        className="w-full border border-edge bg-inset px-4 py-3 text-base text-title transition-colors duration-200 focus:border-light focus:outline-none"
      >
        {CATALOGUED_CLASSES.map((assetClass) => (
          <option key={assetClass} value={assetClass}>
            {profileFor(assetClass).fullName}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ComparisonSection() {
  const [left, setLeft] = useState<AssetClass>("CDB");
  const [right, setRight] = useState<AssetClass>("CRI");

  return (
    <section
      id="comparar"
      data-depth="3"
      aria-labelledby="comparar-title"
      className="relative border-t border-edge-soft bg-surface px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="tech text-amber">Zona iluminada · estruturas lado a lado</p>
          <h2
            id="comparar-title"
            className="mt-6 max-w-[20ch] text-[clamp(2rem,5vw,3.4rem)] leading-[1.04]"
          >
            Dois produtos, as mesmas perguntas.
          </h2>
          <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-aux">
            As diferenças que importam raramente estão no nome. Coloque dois produtos lado
            a lado e veja quem paga, qual a garantia, como funciona o resgate e qual a
            regra tributária.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <Picker label="Primeiro produto" value={left} onChange={setLeft} />
            <Picker label="Segundo produto" value={right} onChange={setRight} />
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-10 overflow-x-auto border border-edge bg-inset">
            <table className="w-full min-w-[46rem] border-collapse text-left align-top">
              <caption className="sr-only">
                Comparação de características entre {profileFor(left).fullName} e{" "}
                {profileFor(right).fullName}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-44 border-b border-edge p-5">
                    <span className="sr-only">Característica</span>
                  </th>
                  {[left, right].map((assetClass, index) => (
                    <th key={index} scope="col" className="border-b border-edge p-5 align-bottom">
                      <span className="tech block text-light">
                        {profileFor(assetClass).label}
                      </span>
                      <span className="mt-2 block font-display text-xl font-normal leading-tight text-title">
                        {profileFor(assetClass).fullName}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label}>
                    <th
                      scope="row"
                      className="border-b border-edge-soft p-5 align-top font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-tertiary"
                    >
                      {row.label}
                    </th>
                    {[left, right].map((assetClass, index) => (
                      <td
                        key={index}
                        className="border-b border-edge-soft p-5 align-top text-base leading-relaxed text-aux"
                      >
                        {row.value(assetClass)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 max-w-[70ch] text-sm leading-relaxed text-muted">
            Esta tabela mostra características verificáveis de cada estrutura. Não ordena,
            não pontua e não indica qual é preferível ou adequado a você — essa leitura
            depende do seu contexto, e não de uma tabela.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
