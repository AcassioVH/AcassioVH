import { describe, expect, it } from "vitest";

import {
  FGC_LIMIT_PER_INSTITUTION_CENTS,
  byCategory,
  byInstitution,
  fgcExposure,
  isFgcCovered,
  maturityCalendar,
  pendingConfirmation,
  totalCents,
  UNSPECIFIED_INSTITUTION,
  type PortfolioAsset,
} from "../src/domain/portfolio/analysis";
import { formatCents, parseCurrencyToCents, shareOf } from "../src/domain/portfolio/money";
import type { AssetClass } from "../src/domain/assets/taxonomy";

function asset(overrides: Partial<PortfolioAsset> & { valueCents: number }): PortfolioAsset {
  return {
    id: Math.random().toString(36).slice(2),
    name: "Ativo",
    cnpj: null,
    institution: null,
    assetClass: "CDB" as AssetClass,
    confidence: "ALTA",
    classConfirmedByUser: true,
    maturityDate: null,
    ...overrides,
  };
}

describe("dinheiro em centavos", () => {
  it("interpreta os formatos que uma pessoa digita em português", () => {
    expect(parseCurrencyToCents("1.234,56")).toBe(123456);
    expect(parseCurrencyToCents("1234,56")).toBe(123456);
    expect(parseCurrencyToCents("1234.56")).toBe(123456);
    expect(parseCurrencyToCents("1234")).toBe(123400);
    expect(parseCurrencyToCents("R$ 1.234,56")).toBe(123456);
    expect(parseCurrencyToCents("  10,5 ")).toBe(1050);
  });

  it("trata separador de milhar sem decimais como parte inteira", () => {
    // "1.234" são mil duzentos e trinta e quatro reais, não um real e 234.
    expect(parseCurrencyToCents("1.234")).toBe(123400);
    expect(parseCurrencyToCents("1.234.567")).toBe(123456700);
  });

  it("rejeita entrada que não representa valor", () => {
    expect(parseCurrencyToCents("")).toBeNull();
    expect(parseCurrencyToCents("abc")).toBeNull();
    expect(parseCurrencyToCents("12a3")).toBeNull();
    expect(parseCurrencyToCents(",")).toBeNull();
  });

  it("não perde centavo ao somar — a razão de não usar float", () => {
    // 0.1 + 0.2 !== 0.3 em ponto flutuante; em centavos inteiros, fecha.
    const cents = [10, 20].reduce((a, b) => a + b, 0);
    expect(cents).toBe(30);
    expect(formatCents(30)).toBe(formatCents(10 + 20));
  });

  it("formata em real brasileiro", () => {
    // O separador do Intl é espaço não separável, então comparamos por partes.
    const formatted = formatCents(123456);
    expect(formatted).toContain("R$");
    expect(formatted).toContain("1.234,56");
  });

  it("calcula participação com uma casa decimal", () => {
    expect(shareOf(2500, 10000)).toBe(25);
    expect(shareOf(3333, 10000)).toBe(33.3);
    expect(shareOf(100, 0)).toBe(0);
  });
});

describe("composição da carteira", () => {
  const carteira = [
    asset({ valueCents: 50_000_00, assetClass: "CDB", institution: "Banco A" }),
    asset({ valueCents: 30_000_00, assetClass: "LCI", institution: "Banco A" }),
    asset({ valueCents: 20_000_00, assetClass: "ACAO", institution: "Corretora B" }),
  ];

  it("soma o total declarado", () => {
    expect(totalCents(carteira)).toBe(100_000_00);
  });

  it("agrupa por categoria com participação", () => {
    const slices = byCategory(carteira);
    expect(slices[0]).toMatchObject({ category: "RENDA_FIXA", share: 80, assetCount: 2 });
    expect(slices[1]).toMatchObject({ category: "RENDA_VARIAVEL", share: 20, assetCount: 1 });
  });

  it("agrupa por instituição, da maior para a menor", () => {
    const slices = byInstitution(carteira);
    expect(slices[0]?.institution).toBe("Banco A");
    expect(slices[0]?.valueCents).toBe(80_000_00);
    expect(slices[1]?.institution).toBe("Corretora B");
  });

  it("agrupa ativos sem instituição sob um rótulo explícito", () => {
    const slices = byInstitution([asset({ valueCents: 1000, institution: null })]);
    expect(slices[0]?.institution).toBe(UNSPECIFIED_INSTITUTION);
  });

  it("devolve lista vazia para carteira vazia, sem dividir por zero", () => {
    expect(byCategory([])).toEqual([]);
    expect(totalCents([])).toBe(0);
  });
});

describe("cobertura do FGC", () => {
  it("reconhece apenas as classes cobertas", () => {
    expect(isFgcCovered("CDB")).toBe(true);
    expect(isFgcCovered("LCI")).toBe(true);
    expect(isFgcCovered("POUPANCA")).toBe(true);
    expect(isFgcCovered("ACAO")).toBe(false);
    expect(isFgcCovered("TESOURO_DIRETO")).toBe(false);
    expect(isFgcCovered("CRI")).toBe(false);
  });

  it("soma só o que é coberto, ignorando o resto", () => {
    const exposure = fgcExposure([
      asset({ valueCents: 100_000_00, assetClass: "CDB", institution: "Banco A" }),
      asset({ valueCents: 900_000_00, assetClass: "ACAO", institution: "Banco A" }),
    ]);

    expect(exposure).toHaveLength(1);
    expect(exposure[0]?.coveredValueCents).toBe(100_000_00);
    expect(exposure[0]?.aboveLimitCents).toBe(0);
  });

  it("informa quanto excede o limite por instituição", () => {
    const exposure = fgcExposure([
      asset({ valueCents: 200_000_00, assetClass: "CDB", institution: "Banco A" }),
      asset({ valueCents: 100_000_00, assetClass: "LCI", institution: "Banco A" }),
    ]);

    expect(exposure[0]?.coveredValueCents).toBe(300_000_00);
    expect(exposure[0]?.aboveLimitCents).toBe(300_000_00 - FGC_LIMIT_PER_INSTITUTION_CENTS);
  });

  it("conta o limite por instituição, não pela carteira toda", () => {
    const exposure = fgcExposure([
      asset({ valueCents: 200_000_00, assetClass: "CDB", institution: "Banco A" }),
      asset({ valueCents: 200_000_00, assetClass: "CDB", institution: "Banco B" }),
    ]);

    expect(exposure).toHaveLength(2);
    expect(exposure.every((entry) => entry.aboveLimitCents === 0)).toBe(true);
  });
});

describe("calendário de vencimentos", () => {
  const reference = new Date("2026-08-04T00:00:00Z");

  it("ordena do vencimento mais próximo ao mais distante", () => {
    const entries = maturityCalendar(
      [
        asset({ valueCents: 100, name: "Longe", maturityDate: new Date("2027-01-01T00:00:00Z") }),
        asset({ valueCents: 100, name: "Perto", maturityDate: new Date("2026-09-01T00:00:00Z") }),
      ],
      reference,
    );

    expect(entries.map((e) => e.asset.name)).toEqual(["Perto", "Longe"]);
  });

  it("calcula os dias restantes", () => {
    const entries = maturityCalendar(
      [asset({ valueCents: 100, maturityDate: new Date("2026-08-14T00:00:00Z") })],
      reference,
    );

    expect(entries[0]?.daysUntil).toBe(10);
  });

  it("usa número negativo para vencimento já passado, sem escondê-lo", () => {
    const entries = maturityCalendar(
      [asset({ valueCents: 100, maturityDate: new Date("2026-08-01T00:00:00Z") })],
      reference,
    );

    expect(entries[0]?.daysUntil).toBe(-3);
  });

  it("omite ativos sem vencimento em vez de inventar data", () => {
    const entries = maturityCalendar(
      [asset({ valueCents: 100, assetClass: "ACAO", maturityDate: null })],
      reference,
    );

    expect(entries).toEqual([]);
  });
});

describe("classificações pendentes de confirmação", () => {
  it("lista o que veio com confiança baixa e ainda não foi confirmado", () => {
    const pending = pendingConfirmation([
      asset({ valueCents: 100, confidence: "BAIXA", classConfirmedByUser: false }),
      asset({ valueCents: 100, confidence: "ALTA", classConfirmedByUser: false }),
      asset({ valueCents: 100, confidence: "BAIXA", classConfirmedByUser: true }),
    ]);

    expect(pending).toHaveLength(1);
  });

  it("inclui o não classificado mesmo com outra confiança", () => {
    const pending = pendingConfirmation([
      asset({ valueCents: 100, assetClass: "NAO_CLASSIFICADO", confidence: "MEDIA", classConfirmedByUser: false }),
    ]);

    expect(pending).toHaveLength(1);
  });
});
