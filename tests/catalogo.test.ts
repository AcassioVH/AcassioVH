/**
 * Guardrail de validade do catálogo.
 *
 * O maior risco deste produto não é técnico, é editorial. Os verbetes afirmam
 * regras de tributação, carência e cobertura do FGC — regras que mudam por lei e
 * por medida provisória. Um verbete desatualizado é conteúdo incorreto sobre
 * matéria regulada, e o conteúdo é o produto inteiro.
 *
 * `CATALOG_REVIEWED_AT` existia como data na tela, o que é transparência mas não
 * é processo: nada acontecia quando ela envelhecia. Este teste transforma
 * "quando alguém lembrar" em CI vermelho numa data conhecida.
 *
 * O prazo é de seis meses porque é o intervalo em que, historicamente, mudanças
 * relevantes de tributação de investimento chegam ao mercado brasileiro. Quando
 * ele estourar, a correção não é empurrar a data: é reler o catálogo e então
 * atualizá-la.
 */

import { describe, expect, it } from "vitest";

import { ASSET_PROFILES, CATALOG_REVIEWED_AT } from "../src/domain/assets/profiles";
import { CATALOGUED_CLASSES, PRODUCT_FAMILIES, familyOf } from "../src/domain/assets/families";
import { ASSET_CLASSES } from "../src/domain/assets/taxonomy";

const MESES_ATE_REVISAR = 6;

function mesesDesde(iso: string): number {
  const revisao = new Date(iso);
  const agora = new Date();
  return (
    (agora.getFullYear() - revisao.getFullYear()) * 12 +
    (agora.getMonth() - revisao.getMonth())
  );
}

describe("validade do catálogo", () => {
  it("tem data de revisão em formato de data real", () => {
    expect(CATALOG_REVIEWED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(new Date(CATALOG_REVIEWED_AT).getTime())).toBe(false);
  });

  it("não foi revisado há mais de seis meses", () => {
    const meses = mesesDesde(CATALOG_REVIEWED_AT);

    expect(
      meses,
      `O catálogo foi revisado pela última vez em ${CATALOG_REVIEWED_AT}, há ${meses} meses.\n` +
        `Regras de tributação e de cobertura do FGC mudam nesse intervalo.\n` +
        `Releia os verbetes antes de mexer em CATALOG_REVIEWED_AT — empurrar a data ` +
        `sem reler é exatamente o que este teste existe para impedir.`,
    ).toBeLessThanOrEqual(MESES_ATE_REVISAR);
  });

  it("não está datado no futuro", () => {
    expect(new Date(CATALOG_REVIEWED_AT).getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe("integridade do catálogo", () => {
  it("dá ficha a toda classe declarada", () => {
    const comFicha = new Set(ASSET_PROFILES.map((p) => p.assetClass));
    const semFicha = ASSET_CLASSES.filter((c) => !comFicha.has(c));

    expect(semFicha, `classes sem ficha: ${semFicha.join(", ")}`).toEqual([]);
  });

  it("põe toda classe catalogada em exatamente uma família", () => {
    for (const assetClass of CATALOGUED_CLASSES) {
      const familias = PRODUCT_FAMILIES.filter((f) => f.classes.includes(assetClass));
      expect(familias.length, `${assetClass} está em ${familias.length} famílias`).toBe(1);
    }
  });

  it("não deixa família sem produto", () => {
    for (const familia of PRODUCT_FAMILIES) {
      expect(familia.classes.length, `família ${familia.id} está vazia`).toBeGreaterThan(0);
    }
  });

  /**
   * A ficha de fallback existe para quando o classificador não identifica o
   * ativo. Ela não é um produto, e não pode aparecer na navegação: quem entrasse
   * numa categoria e encontrasse "A classificar" veria um defeito, não um verbete.
   */
  it("mantém a ficha de fallback fora da navegação", () => {
    expect(CATALOGUED_CLASSES).not.toContain("NAO_CLASSIFICADO");
    expect(familyOf("NAO_CLASSIFICADO")).toBeNull();
  });
});
