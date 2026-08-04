/**
 * Guardrail de conformidade regulatória.
 *
 * Este é o teste mais importante do repositório. Ele existe porque a regra
 * "nunca recomendar" não pode depender de alguém lembrar dela ao escrever uma
 * ficha nova daqui a seis meses. Se um texto voltado ao usuário passar a
 * carregar recomendação, juízo de valor sobre ativo ou afirmação de
 * rentabilidade, o CI fica vermelho.
 *
 * Escopo atual: catálogo educativo, textos da política e racionais do motor de
 * classificação. Copy de UI escrita direto em JSX ainda não é varrida — está
 * anotado em docs/RISKS.md como dívida conhecida.
 */

import { describe, expect, it } from "vitest";

import { classifyAsset } from "../src/domain/assets/classify";
import { ASSET_PROFILES, profileFor } from "../src/domain/assets/profiles";
import { ASSET_CLASSES } from "../src/domain/assets/taxonomy";
import {
  DISCLAIMER_FULL,
  DISCLAIMER_SHORT,
  SCOPE_STATEMENT,
  findViolations,
} from "../src/domain/compliance/policy";

/** Todo texto de uma ficha, achatado com rótulo de origem para o relatório de erro. */
function textFragmentsOf(profile: (typeof ASSET_PROFILES)[number]): [string, string][] {
  const at = (field: string) => `${profile.assetClass}.${field}`;
  return [
    [at("summary"), profile.summary],
    [at("whatItIs"), profile.whatItIs],
    [at("issuedBy"), profile.issuedBy],
    [at("liquidity"), profile.liquidity],
    [at("taxation"), profile.taxation],
    [at("guarantee.description"), profile.guarantee.description],
    ...profile.characteristics.map(
      (text, i) => [at(`characteristics[${i}]`), text] as [string, string],
    ),
    ...profile.officialSources.map(
      (source, i) => [at(`officialSources[${i}]`), source.whatYouFindThere] as [string, string],
    ),
  ];
}

describe("linguagem do catálogo educativo", () => {
  it("não contém vocabulário de recomendação, juízo de valor ou rentabilidade", () => {
    const violations = ASSET_PROFILES.flatMap((profile) =>
      textFragmentsOf(profile).flatMap(([source, text]) => findViolations(text, source)),
    );

    expect(
      violations,
      violations.map((v) => `\n  [${v.source}] ${v.reason}: ${v.excerpt}`).join(""),
    ).toEqual([]);
  });

  it("não contém vocabulário proibido nos textos da própria política", () => {
    const texts: [string, string][] = [
      ["DISCLAIMER_SHORT", DISCLAIMER_SHORT],
      ["DISCLAIMER_FULL", DISCLAIMER_FULL],
      ["SCOPE_STATEMENT", SCOPE_STATEMENT],
    ];

    // O disclaimer nega a recomendação, então usa a palavra legitimamente.
    // Filtramos só esse caso conhecido em vez de afrouxar o padrão global.
    const violations = texts
      .flatMap(([source, text]) => findViolations(text, source))
      .filter((v) => v.reason !== "recomendação explícita");

    expect(violations).toEqual([]);
  });

  it("não contém vocabulário proibido nos racionais do classificador", () => {
    const samples = [
      "CDB Banco Exemplo 2027",
      "Tesouro IPCA+ 2035",
      "KNRI11",
      "PETR4",
      "ativo desconhecido xyz",
    ];

    const violations = samples.flatMap((name) =>
      findViolations(classifyAsset({ declaredName: name }).rationale, `rationale(${name})`),
    );

    expect(violations).toEqual([]);
  });
});

describe("integridade do catálogo", () => {
  it("tem ficha educativa para toda classe da taxonomia", () => {
    for (const assetClass of ASSET_CLASSES) {
      expect(profileFor(assetClass).assetClass, `sem ficha para ${assetClass}`).toBe(assetClass);
    }
  });

  it("aponta ao menos uma fonte oficial em cada ficha", () => {
    for (const profile of ASSET_PROFILES) {
      expect(profile.officialSources.length, `${profile.assetClass} sem fonte`).toBeGreaterThan(0);
    }
  });

  it("usa apenas fontes oficiais em https", () => {
    for (const profile of ASSET_PROFILES) {
      for (const source of profile.officialSources) {
        expect(source.url.startsWith("https://"), `${profile.assetClass}: ${source.url}`).toBe(true);
      }
    }
  });
});

describe("guardrail detecta violações reais", () => {
  // Um teste que só verifica ausência passaria mesmo com a varredura quebrada.
  // Estes exemplos garantem que o detector de fato detecta.
  const shouldBeCaught = [
    "Recomendamos manter esse ativo em carteira.",
    "Essa é a melhor opção de renda fixa hoje.",
    "Vale a pena migrar para outro emissor.",
    "Rende 12% ao ano com ganho garantido.",
    "O papel vai subir nos próximos meses.",
    "Investimento sem risco para seu perfil.",
  ];

  it.each(shouldBeCaught)("bloqueia: %s", (text) => {
    expect(findViolations(text, "amostra").length).toBeGreaterThan(0);
  });

  it("não acusa texto puramente descritivo", () => {
    const descriptive =
      "O CDB é um título emitido por bancos. O prazo é definido na contratação e o " +
      "Imposto de Renda segue tabela regressiva conforme o tempo de aplicação.";
    expect(findViolations(descriptive, "amostra")).toEqual([]);
  });
});
