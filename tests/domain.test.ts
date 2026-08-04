import { describe, expect, it } from "vitest";

import { classifyAsset } from "../src/domain/assets/classify";
import { categoryOf } from "../src/domain/assets/taxonomy";
import { formatCnpj, isValidCnpj, maskCnpjInput, parseCnpj } from "../src/domain/cnpj/cnpj";

describe("validação de CNPJ", () => {
  it("aceita CNPJs com dígito verificador correto", () => {
    // CNPJs públicos reais: Banco do Brasil e Itaú Unibanco.
    expect(isValidCnpj("00.000.000/0001-91")).toBe(true);
    expect(isValidCnpj("60872504000123")).toBe(true);
  });

  it("rejeita dígito verificador incorreto", () => {
    expect(isValidCnpj("00.000.000/0001-92")).toBe(false);
  });

  it("rejeita comprimento inválido", () => {
    expect(isValidCnpj("123")).toBe(false);
    expect(isValidCnpj("000000000001911")).toBe(false);
  });

  it("rejeita sequências repetidas que passariam no módulo 11", () => {
    expect(isValidCnpj("00000000000000")).toBe(false);
    expect(isValidCnpj("11111111111111")).toBe(false);
  });

  it("ignora máscara e espaços", () => {
    expect(isValidCnpj("  00.000.000 / 0001-91 ")).toBe(true);
  });

  it("parseCnpj devolve null para entrada inválida", () => {
    expect(parseCnpj("00.000.000/0001-92")).toBeNull();
    expect(parseCnpj("00.000.000/0001-91")).toBe("00000000000191");
  });

  it("formata para exibição", () => {
    expect(formatCnpj("00000000000191")).toBe("00.000.000/0001-91");
  });

  it("mascara progressivamente enquanto digita", () => {
    expect(maskCnpjInput("00")).toBe("00");
    expect(maskCnpjInput("00000")).toBe("00.000");
    expect(maskCnpjInput("000000000")).toBe("00.000.000/0");
    expect(maskCnpjInput("00000000000191")).toBe("00.000.000/0001-91");
    expect(maskCnpjInput("0000000000019199999")).toBe("00.000.000/0001-91");
  });
});

describe("classificação de ativos", () => {
  it("identifica classes pelo nome declarado", () => {
    const cases: [string, string][] = [
      ["CDB Banco Exemplo 2027", "CDB"],
      ["LCI 90 dias Banco Exemplo", "LCI"],
      ["LCA Banco Exemplo", "LCA"],
      ["Tesouro IPCA+ 2035", "TESOURO_DIRETO"],
      ["Tesouro Selic 2029", "TESOURO_DIRETO"],
      ["CRI Securitizadora Exemplo", "CRI"],
      ["CRA Exemplo Agro", "CRA"],
      ["Debênture Exemplo Energia", "DEBENTURE"],
      ["COE Exemplo Índice", "COE"],
      ["VGBL Exemplo Seguradora", "PREVIDENCIA"],
      ["Fundo de Investimento Imobiliário Exemplo", "FII"],
      ["Fiagro Exemplo", "FIAGRO"],
      ["Poupança", "POUPANCA"],
    ];

    for (const [name, expected] of cases) {
      expect(classifyAsset({ declaredName: name }).assetClass, name).toBe(expected);
    }
  });

  it("prefere a regra mais específica sobre a genérica", () => {
    // "Fundo de Investimento Imobiliário" contém "fundo de investimento";
    // a regra de FII precisa vencer a de FUNDO.
    expect(classifyAsset({ declaredName: "Fundo de Investimento Imobiliário XP" }).assetClass).toBe(
      "FII",
    );
  });

  it("reconhece tickers de ação", () => {
    const result = classifyAsset({ declaredName: "PETR4" });
    expect(result.assetClass).toBe("ACAO");
    expect(result.confidence).toBe("MEDIA");
  });

  it("marca ticker terminado em 11 como ambíguo e pede confirmação", () => {
    const result = classifyAsset({ declaredName: "KNRI11" });
    expect(result.confidence).toBe("BAIXA");
    expect(result.needsUserConfirmation).toBe(true);
  });

  it("cai em NAO_CLASSIFICADO sem chutar quando não reconhece", () => {
    const result = classifyAsset({ declaredName: "aplicação genérica 123" });
    expect(result.assetClass).toBe("NAO_CLASSIFICADO");
    expect(result.needsUserConfirmation).toBe(true);
  });

  it("respeita a classificação manual do usuário", () => {
    const result = classifyAsset({ declaredName: "qualquer coisa", userOverride: "LCI" });
    expect(result.assetClass).toBe("LCI");
    expect(result.confidence).toBe("ALTA");
    expect(result.needsUserConfirmation).toBe(false);
  });

  it("reduz a confiança quando o CNPJ não valida", () => {
    const valid = classifyAsset({ declaredName: "CDB Exemplo", cnpj: "00.000.000/0001-91" });
    const invalid = classifyAsset({ declaredName: "CDB Exemplo", cnpj: "00.000.000/0001-92" });

    expect(valid.confidence).toBe("ALTA");
    expect(invalid.confidence).toBe("MEDIA");
    expect(invalid.cnpjIsValid).toBe(false);
  });

  it("mapeia toda classe para uma categoria de composição", () => {
    expect(categoryOf("CDB")).toBe("RENDA_FIXA");
    expect(categoryOf("ACAO")).toBe("RENDA_VARIAVEL");
    expect(categoryOf("FII")).toBe("FUNDOS");
    expect(categoryOf("NAO_CLASSIFICADO")).toBe("INDEFINIDO");
  });
});
