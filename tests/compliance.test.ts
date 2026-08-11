/**
 * Guardrail de conformidade regulatória.
 *
 * Este é o teste mais importante do repositório. Ele existe porque a regra
 * "nunca recomendar" não pode depender de alguém lembrar dela ao escrever uma
 * ficha nova daqui a seis meses. Se um texto voltado ao usuário passar a
 * carregar recomendação, juízo de valor sobre ativo ou afirmação de
 * rentabilidade, o CI fica vermelho.
 *
 * Escopo atual: catálogo educativo, navegação por categoria e destino, textos da
 * política e racionais do motor de classificação. Copy de UI escrita direto em
 * JSX ainda não é varrida — está anotado em docs/RISKS.md como dívida conhecida.
 */

import { describe, expect, it } from "vitest";

import { classifyAsset } from "../src/domain/assets/classify";
import {
  CATALOGUED_CLASSES,
  CATEGORIES,
  DESTINATIONS,
} from "../src/domain/assets/destinations";
import { ASSET_PROFILES, profileFor } from "../src/domain/assets/profiles";
import { ASSET_CLASSES } from "../src/domain/assets/taxonomy";
import {
  INSTITUTION_GROUPS,
  INSTITUTION_KINDS,
  NOT_A_FINANCIAL_INSTITUTION,
  WHERE_TO_CHECK,
} from "../src/domain/institutions/kinds";
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
    [at("liquidityTag"), profile.liquidityTag],
    [at("taxation"), profile.taxation],
    [at("taxTag"), profile.taxTag],
    [at("guarantee.description"), profile.guarantee.description],
    ...profile.characteristics.map(
      (text, i) => [at(`characteristics[${i}]`), text] as [string, string],
    ),
    ...profile.officialSources.map(
      (source, i) => [at(`officialSources[${i}]`), source.whatYouFindThere] as [string, string],
    ),
  ];
}

/**
 * A navegação também é conteúdo.
 *
 * Categoria e destino não são só rótulos de arrumação: elas afirmam coisas sobre
 * os produtos ("você empresta a um banco", "não há valor de resgate contratado")
 * e aparecem na tela do mesmo jeito que um verbete. Ficaram de fora da varredura
 * quando foram criadas — e um texto que orienta escolha caberia perfeitamente
 * num campo desses.
 */
function navigationFragments(): [string, string][] {
  return [
    ...CATEGORIES.flatMap((category): [string, string][] => [
      [`categoria.${category.id}.label`, category.label],
      [`categoria.${category.id}.summary`, category.summary],
      [`categoria.${category.id}.trait`, category.trait],
    ]),
    ...DESTINATIONS.flatMap((destination): [string, string][] => [
      [`destino.${destination.id}.label`, destination.label],
      [`destino.${destination.id}.target`, destination.target],
      [`destino.${destination.id}.blurb`, destination.blurb],
      ...destination.chain.map(
        (node, i) => [`destino.${destination.id}.chain[${i}]`, node] as [string, string],
      ),
    ]),
  ];
}

/**
 * A página de instituições é a superfície de maior risco do site.
 *
 * Ela fala de quem emite, e o passo seguinte natural — "e qual banco é melhor?"
 * — é exatamente a fronteira que não se atravessa. A varredura entra aqui no
 * mesmo dia em que o conteúdo nasce, e não seis meses depois.
 */
function institutionFragments(): [string, string][] {
  return [
    ["instituicoes.ressalva", NOT_A_FINANCIAL_INSTITUTION],
    ...INSTITUTION_GROUPS.flatMap((group): [string, string][] => [
      [`grupo.${group.id}.label`, group.label],
      [`grupo.${group.id}.summary`, group.summary],
    ]),
    ...INSTITUTION_KINDS.flatMap((kind): [string, string][] => [
      [`tipo.${kind.id}.label`, kind.label],
      [`tipo.${kind.id}.short`, kind.short],
      [`tipo.${kind.id}.role`, kind.role],
      [`tipo.${kind.id}.whatItIs`, kind.whatItIs],
      [`tipo.${kind.id}.guarantee`, kind.guarantee],
      [`tipo.${kind.id}.guaranteeTag`, kind.guaranteeTag],
      ...(kind.alias ? ([[`tipo.${kind.id}.alias`, kind.alias]] as [string, string][]) : []),
      ...(kind.issuesNote
        ? ([[`tipo.${kind.id}.issuesNote`, kind.issuesNote]] as [string, string][])
        : []),
    ]),
    ...WHERE_TO_CHECK.map(
      (source, i) => [`conferir[${i}]`, source.whatYouFindThere] as [string, string],
    ),
  ];
}

/**
 * Nomes de instituição que não têm outro sentido em prosa portuguesa.
 *
 * Sem a flag `g`: com ela, `RegExp.test` guarda `lastIndex` entre chamadas e a
 * varredura passaria a pular casos alternadamente.
 */
const NOMES_DE_INSTITUICAO =
  /\b(ita[úu]|bradesco|santander|banco do brasil|caixa econ[ôo]mica|nubank|btg pactual|sicredi|sicoob|picpay|avenue|nomad|will bank|xp investimentos)\b/i;

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

  it("não contém vocabulário de recomendação na navegação por categoria e destino", () => {
    const fragments = navigationFragments();

    // Uma varredura sobre lista vazia passaria calada. A contagem mínima faz o
    // teste falhar se alguém esvaziar o catálogo de navegação sem perceber.
    expect(fragments.length).toBeGreaterThan(40);

    const violations = fragments.flatMap(([source, text]) => findViolations(text, source));

    expect(
      violations,
      violations.map((v) => `\n  [${v.source}] ${v.reason}: ${v.excerpt}`).join(""),
    ).toEqual([]);
  });

  it("não contém vocabulário de recomendação nos tipos de instituição", () => {
    const fragments = institutionFragments();

    // Mesma trava da navegação: uma varredura sobre lista vazia passaria calada.
    expect(fragments.length).toBeGreaterThan(60);

    const violations = fragments.flatMap(([source, text]) => findViolations(text, source));

    expect(
      violations,
      violations.map((v) => `\n  [${v.source}] ${v.reason}: ${v.excerpt}`).join(""),
    ).toEqual([]);
  });

  /**
   * A regra que sustenta a página inteira: tipos, nunca instituições nomeadas.
   *
   * Descrever o Banco X é análise de emissor, e exige registro que este site não
   * tem. O teste é o tripwire da tentação mais provável — "por exemplo, o
   * Nubank emite…" — escrita por alguém que quer deixar o texto mais concreto.
   *
   * **A lista é curta de propósito, e a primeira versão dela não era.** Uma rede
   * larga trazia "inter", "pan", "modal", "clear", "safra", "original" — que são
   * palavras comuns do português antes de serem marcas — e "rico", que casou
   * dentro de "histórico", porque `\b` no JavaScript é ASCII e enxerga fronteira
   * de palavra depois de um "ó". Guardrail que acusa texto inocente é guardrail
   * que alguém afrouxa na primeira pressa. Ficaram só os nomes que não têm outro
   * sentido em prosa.
   *
   * B3 fica de fora da lista deliberadamente: é infraestrutura única do mercado,
   * citada como a depositária central do país. Não é emissor, não há alternativa
   * a comparar com ela, e omitir o nome deixaria a explicação sem endereço.
   */
  it("não nomeia instituição financeira específica", () => {
    const achados = institutionFragments()
      .filter(([, text]) => NOMES_DE_INSTITUICAO.test(text))
      .map(([source, text]) => `${source}: ${NOMES_DE_INSTITUICAO.exec(text)?.[0]}`);

    expect(achados, achados.join("\n")).toEqual([]);
  });

  // Um teste que só verifica ausência passaria mesmo com o padrão quebrado.
  it.each([
    "Um exemplo prático: o Nubank emite CDB coberto pelo FGC.",
    "Bancos como o Itaú e o Bradesco são bancos múltiplos.",
  ])("o tripwire de nomes dispara em: %s", (texto) => {
    expect(NOMES_DE_INSTITUICAO.test(texto)).toBe(true);
  });

  // …e não pode disparar em prosa legítima. "histórico" contém "rico".
  it.each([
    "o histórico de reclamações registradas contra ela",
    "capta no mercado, sem autorização do Banco Central",
  ])("o tripwire de nomes não acusa: %s", (texto) => {
    expect(NOMES_DE_INSTITUICAO.test(texto)).toBe(false);
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

describe("integridade dos tipos de instituição", () => {
  it("põe todo tipo em exatamente um grupo", () => {
    for (const kind of INSTITUTION_KINDS) {
      const grupos = INSTITUTION_GROUPS.filter((group) => group.kindIds.includes(kind.id));
      expect(grupos.length, `${kind.id} está em ${grupos.length} grupos`).toBe(1);
    }
  });

  it("não referencia tipo inexistente em grupo nenhum", () => {
    const ids = new Set(INSTITUTION_KINDS.map((kind) => kind.id));
    for (const group of INSTITUTION_GROUPS) {
      for (const kindId of group.kindIds) {
        expect(ids.has(kindId), `grupo ${group.id} aponta para ${kindId}, que não existe`).toBe(
          true,
        );
      }
    }
  });

  /**
   * Sem isto, um produto renomeado no catálogo deixaria a página de
   * instituições com link para uma ficha que não existe — e a rota estática
   * nem sequer é gerada, então o erro só apareceria em 404 de visitante.
   */
  it("só emite produtos que existem no catálogo", () => {
    for (const kind of INSTITUTION_KINDS) {
      for (const assetClass of kind.issues) {
        expect(
          CATALOGUED_CLASSES.includes(assetClass),
          `${kind.id} emite ${assetClass}, que não está catalogado`,
        ).toBe(true);
      }
    }
  });

  it("explica o que faz quem não emite nada", () => {
    for (const kind of INSTITUTION_KINDS) {
      if (kind.issues.length > 0) continue;
      expect(kind.issuesNote, `${kind.id} não emite e não explica o porquê`).toBeTruthy();
    }
  });

  it("usa apenas fontes oficiais em https para conferir instituição", () => {
    for (const source of WHERE_TO_CHECK) {
      expect(source.url.startsWith("https://"), `${source.label}: ${source.url}`).toBe(true);
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
    // As conjugações passavam batido enquanto o padrão cobria só o presente —
    // inclusive esta, que docs/COMPLIANCE.md já listava como exemplo do que não
    // pode. A lacuna ficou visível quando o boletim de conjuntura passou a
    // gerar texto no tempo verbal que a notícia pedisse.
    "Esse fundo rendeu 12% no ano.",
    "O papel deve render 14% ao ano.",
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
