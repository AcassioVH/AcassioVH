/**
 * Taxonomia de ativos.
 *
 * Este arquivo define *o que existe* no sistema. Repare no que ele não define:
 * não há nível de risco, nota, ranking ou qualquer eixo ordenável entre classes.
 * Classes de ativo aqui são categorias descritivas, não degraus de uma escada.
 */

export const ASSET_CLASSES = [
  "CDB",
  "LCI",
  "LCA",
  "LC",
  "CRI",
  "CRA",
  "DEBENTURE",
  "TESOURO_DIRETO",
  "POUPANCA",
  "ACAO",
  "BDR",
  "FII",
  "FIAGRO",
  "ETF",
  "FUNDO",
  "PREVIDENCIA",
  "COE",
  "NAO_CLASSIFICADO",
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number];

export const ASSET_CATEGORIES = [
  "RENDA_FIXA",
  "RENDA_VARIAVEL",
  "FUNDOS",
  "PREVIDENCIA",
  "ESTRUTURADO",
  "INDEFINIDO",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  RENDA_FIXA: "Renda fixa",
  RENDA_VARIAVEL: "Renda variável",
  FUNDOS: "Fundos",
  PREVIDENCIA: "Previdência",
  ESTRUTURADO: "Estruturado",
  INDEFINIDO: "A classificar",
};

/**
 * Cor de cada categoria nos gráficos de composição.
 *
 * Deliberadamente sem semântica de semáforo: não há verde no sistema, e não há
 * vermelho aqui. Verde diria "bom" e vermelho diria "ruim" — o produto não
 * emite juízo sobre classe de ativo nenhuma, e a paleta precisa obedecer isso
 * antes de qualquer consideração estética.
 *
 * A sequência vai do âmbar da marca ao azul frio, ordenada por participação
 * típica e não por mérito. Nenhum gráfico depende só da cor: legenda e valor
 * acompanham sempre.
 */
export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  RENDA_FIXA: "#E3BC7E",
  FUNDOS: "#C9954A",
  RENDA_VARIAVEL: "#8FBCC2",
  PREVIDENCIA: "#6C8E96",
  ESTRUTURADO: "#94A7C4",
  INDEFINIDO: "#6C7E82",
};

export const CLASS_TO_CATEGORY: Record<AssetClass, AssetCategory> = {
  CDB: "RENDA_FIXA",
  LCI: "RENDA_FIXA",
  LCA: "RENDA_FIXA",
  LC: "RENDA_FIXA",
  CRI: "RENDA_FIXA",
  CRA: "RENDA_FIXA",
  DEBENTURE: "RENDA_FIXA",
  TESOURO_DIRETO: "RENDA_FIXA",
  POUPANCA: "RENDA_FIXA",
  ACAO: "RENDA_VARIAVEL",
  BDR: "RENDA_VARIAVEL",
  FII: "FUNDOS",
  FIAGRO: "FUNDOS",
  ETF: "FUNDOS",
  FUNDO: "FUNDOS",
  PREVIDENCIA: "PREVIDENCIA",
  COE: "ESTRUTURADO",
  NAO_CLASSIFICADO: "INDEFINIDO",
};

export function categoryOf(assetClass: AssetClass): AssetCategory {
  return CLASS_TO_CATEGORY[assetClass];
}
