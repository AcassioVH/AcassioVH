/**
 * Taxonomia de ativos.
 *
 * Este arquivo define *o que existe* no sistema. Repare no que ele não define:
 * não há nível de risco, nota, ranking ou qualquer eixo ordenável entre classes.
 * Classes de ativo aqui são categorias descritivas, não degraus de uma escada.
 */

export const ASSET_CLASSES = [
  // Renda fixa — dívida soberana
  "TESOURO_DIRETO",
  // Renda fixa — bancária
  "CDB",
  "RDB",
  "LCI",
  "LCA",
  "LC",
  "LF",
  "LIG",
  "DPGE",
  "POUPANCA",
  // Renda fixa — crédito privado
  "DEBENTURE",
  // Renda fixa — securitização
  "CRI",
  "CRA",
  "CDCA",
  // Renda variável — participação societária
  "ACAO",
  "UNIT",
  // Renda variável — fundos listados
  "FII",
  "FIAGRO",
  "ETF",
  "FI_INFRA",
  "FIP",
  // Internacional
  "BDR",
  "ETF_INTERNACIONAL",
  "ACAO_EXTERIOR",
  "REIT",
  "BOND_EXTERIOR",
  "FUNDO_CAMBIAL",
  // Fundos
  "FUNDO",
  "FUNDO_RENDA_FIXA",
  "FUNDO_MULTIMERCADO",
  "FUNDO_ACOES",
  "FIDC",
  // Previdência
  "PREVIDENCIA",
  "PGBL",
  "VGBL",
  // Estruturado
  "COE",
  // Fallback
  "NAO_CLASSIFICADO",
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number];

export const ASSET_CATEGORIES = [
  "RENDA_FIXA",
  "RENDA_VARIAVEL",
  "INTERNACIONAL",
  "FUNDOS",
  "PREVIDENCIA",
  "ESTRUTURADO",
  "INDEFINIDO",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  RENDA_FIXA: "Renda fixa",
  RENDA_VARIAVEL: "Renda variável",
  INTERNACIONAL: "Internacional",
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
  INTERNACIONAL: "#94A7C4",
  PREVIDENCIA: "#6C8E96",
  ESTRUTURADO: "#A38FA8",
  INDEFINIDO: "#6C7E82",
};

export const CLASS_TO_CATEGORY: Record<AssetClass, AssetCategory> = {
  TESOURO_DIRETO: "RENDA_FIXA",
  CDB: "RENDA_FIXA",
  RDB: "RENDA_FIXA",
  LCI: "RENDA_FIXA",
  LCA: "RENDA_FIXA",
  LC: "RENDA_FIXA",
  LF: "RENDA_FIXA",
  LIG: "RENDA_FIXA",
  DPGE: "RENDA_FIXA",
  POUPANCA: "RENDA_FIXA",
  DEBENTURE: "RENDA_FIXA",
  CRI: "RENDA_FIXA",
  CRA: "RENDA_FIXA",
  CDCA: "RENDA_FIXA",
  ACAO: "RENDA_VARIAVEL",
  UNIT: "RENDA_VARIAVEL",
  FII: "RENDA_VARIAVEL",
  FIAGRO: "RENDA_VARIAVEL",
  ETF: "RENDA_VARIAVEL",
  FI_INFRA: "RENDA_VARIAVEL",
  FIP: "RENDA_VARIAVEL",
  BDR: "INTERNACIONAL",
  ETF_INTERNACIONAL: "INTERNACIONAL",
  ACAO_EXTERIOR: "INTERNACIONAL",
  REIT: "INTERNACIONAL",
  BOND_EXTERIOR: "INTERNACIONAL",
  FUNDO_CAMBIAL: "INTERNACIONAL",
  FUNDO: "FUNDOS",
  FUNDO_RENDA_FIXA: "FUNDOS",
  FUNDO_MULTIMERCADO: "FUNDOS",
  FUNDO_ACOES: "FUNDOS",
  FIDC: "FUNDOS",
  PREVIDENCIA: "PREVIDENCIA",
  PGBL: "PREVIDENCIA",
  VGBL: "PREVIDENCIA",
  COE: "ESTRUTURADO",
  NAO_CLASSIFICADO: "INDEFINIDO",
};

export function categoryOf(assetClass: AssetClass): AssetCategory {
  return CLASS_TO_CATEGORY[assetClass];
}
