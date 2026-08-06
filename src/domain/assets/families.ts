/**
 * A arquitetura de navegação do site, em dois níveis.
 *
 *   CATEGORIA (renda fixa, renda variável, internacional…) — o vocabulário que
 *   o visitante já tem quando chega.
 *
 *   FAMÍLIA (dívida soberana, securitização…) — o corte por QUEM PAGA VOCÊ, que
 *   é o que de fato distingue um produto do outro.
 *
 * A categoria é a porta; a família é a explicação. Entrar por "renda fixa" e
 * descobrir que ali dentro há quatro pagadores diferentes — o Tesouro, um banco,
 * uma empresa e uma carteira de recebíveis — é o momento em que o site ensina
 * alguma coisa.
 *
 * `chain` é a cadeia de pagamento, e vira diagrama na tela. É estrutura pura:
 * descreve o caminho do dinheiro, sem dizer se o caminho é bom.
 */

import type { AssetClass } from "./taxonomy";

export type ProductFamily = {
  readonly id: string;
  readonly label: string;
  /** Quem, concretamente, paga o investidor. */
  readonly whoPays: string;
  /** Uma frase. Nada além disso — o detalhe vive no verbete. */
  readonly blurb: string;
  /** Cadeia de pagamento, do pagador final até você. Vira diagrama. */
  readonly chain: readonly string[];
  readonly classes: readonly AssetClass[];
};

export const PRODUCT_FAMILIES: readonly ProductFamily[] = [
  {
    id: "soberano",
    label: "Dívida soberana",
    whoPays: "O Tesouro Nacional",
    blurb: "Você empresta ao governo federal.",
    chain: ["Tesouro Nacional", "Você"],
    classes: ["TESOURO_DIRETO"],
  },
  {
    id: "bancaria",
    label: "Renda fixa bancária",
    whoPays: "Uma instituição financeira",
    blurb: "Você empresta a um banco. É a família em que mora a cobertura do FGC.",
    chain: ["Tomadores de crédito", "Banco emissor", "Você"],
    classes: ["CDB", "RDB", "LCI", "LCA", "LC", "LF", "LIG", "DPGE", "POUPANCA"],
  },
  {
    id: "corporativo",
    label: "Crédito privado",
    whoPays: "Uma empresa",
    blurb: "Você empresta direto a uma companhia, sem banco no meio.",
    chain: ["Empresa emissora", "Você"],
    classes: ["DEBENTURE"],
  },
  {
    id: "securitizacao",
    label: "Securitização",
    whoPays: "Os devedores de uma carteira de recebíveis",
    blurb: "Pagamentos futuros viram um título negociável.",
    chain: ["Devedores dos recebíveis", "Securitizadora", "Você"],
    classes: ["CRI", "CRA", "CDCA"],
  },
  {
    id: "acoes",
    label: "Participação societária",
    whoPays: "O mercado na venda, e a empresa quando distribui",
    blurb: "Você vira sócio. Não há prazo nem valor de resgate contratado.",
    chain: ["Resultado da empresa", "Mercado", "Você"],
    classes: ["ACAO", "UNIT"],
  },
  {
    id: "listados",
    label: "Fundos listados",
    whoPays: "A carteira do fundo, distribuída entre cotistas",
    blurb: "Cotas negociadas em bolsa, com carteira definida em regulamento.",
    chain: ["Ativos da carteira", "Fundo", "Você (cotista)"],
    classes: ["FII", "FIAGRO", "ETF", "FI_INFRA"],
  },
  {
    id: "participacoes",
    label: "Participação em empresas fechadas",
    whoPays: "A venda das empresas investidas, ao fim do ciclo",
    blurb: "O fundo compra parte de companhias fechadas e participa da gestão delas.",
    chain: ["Empresas investidas", "Fundo", "Você (cotista)"],
    classes: ["FIP"],
  },
  {
    id: "recibos",
    label: "Listado aqui, lastro lá fora",
    whoPays: "Um ativo no exterior, por meio de uma estrutura brasileira",
    blurb: "Você negocia em reais, na B3, um papel que representa algo de fora.",
    chain: ["Ativo no exterior", "Estrutura brasileira", "Você"],
    classes: ["BDR", "ETF_INTERNACIONAL"],
  },
  {
    id: "exterior",
    label: "Direto no exterior",
    whoPays: "O emissor estrangeiro, na moeda dele",
    blurb: "Conta fora do país, ativo original, regulação do país de origem.",
    chain: ["Emissor no exterior", "Corretora no exterior", "Você"],
    classes: ["ACAO_EXTERIOR", "REIT", "BOND_EXTERIOR"],
  },
  {
    id: "cambial",
    label: "Exposição cambial",
    whoPays: "A carteira do fundo, atrelada a uma moeda",
    blurb: "Aplicação em reais que acompanha a variação de uma moeda estrangeira.",
    chain: ["Variação da moeda", "Fundo cambial", "Você (cotista)"],
    classes: ["FUNDO_CAMBIAL"],
  },
  {
    id: "abertos",
    label: "Fundos abertos",
    whoPays: "A carteira do fundo, no resgate",
    blurb: "Aplicação e resgate com o próprio fundo, nos prazos do regulamento.",
    chain: ["Ativos da carteira", "Gestor", "Você (cotista)"],
    classes: ["FUNDO", "FUNDO_RENDA_FIXA", "FUNDO_MULTIMERCADO", "FUNDO_ACOES"],
  },
  {
    id: "creditorios",
    label: "Fundos de recebíveis",
    whoPays: "Os devedores dos créditos que o fundo comprou",
    blurb: "A carteira é feita de dívidas de terceiros a receber.",
    chain: ["Devedores dos créditos", "Fundo", "Você (cotista)"],
    classes: ["FIDC"],
  },
  {
    id: "previdencia",
    label: "Previdência",
    whoPays: "Uma seguradora, sob supervisão da SUSEP",
    blurb: "Acumulação de longo prazo em estrutura de seguro.",
    chain: ["Carteira do plano", "Seguradora", "Você"],
    classes: ["PREVIDENCIA", "PGBL", "VGBL"],
  },
  {
    id: "estruturado",
    label: "Estruturado",
    whoPays: "O banco emissor, conforme regras com derivativos",
    blurb: "Renda fixa e derivativos empacotados num produto só.",
    chain: ["Ativo de referência", "Banco emissor", "Você"],
    classes: ["COE"],
  },
];

export type Category = {
  readonly id: string;
  readonly label: string;
  /** Uma frase que responde "o que é isto" antes de qualquer detalhe. */
  readonly summary: string;
  /** O traço estrutural comum a tudo que está dentro. */
  readonly trait: string;
  /**
   * Cor de identificação da categoria, usada em cartão e em gráfico.
   *
   * A paleta é deliberadamente não-semáforo: nenhum verde, nenhum vermelho. Cor
   * aqui distingue categoria, e distinguir não é ordenar — verde diria "boa" e
   * vermelho diria "ruim" sobre coisas que o site não julga.
   */
  readonly accent: string;
  readonly familyIds: readonly string[];
};

/**
 * As categorias, na ordem em que aparecem na home.
 *
 * O vocabulário é o que o visitante já traz — "renda fixa", "renda variável",
 * "internacional". A promessa da categoria é sempre a mesma: em uma frase, o
 * que é; e, ao entrar, quem paga cada coisa lá dentro.
 */
export const CATEGORIES: readonly Category[] = [
  {
    id: "renda-fixa",
    label: "Renda fixa",
    summary: "Você empresta dinheiro e há uma regra de devolução combinada desde o início.",
    trait: "A remuneração é conhecida em fórmula, e há prazo definido.",
    accent: "#E3BC7E",
    familyIds: ["soberano", "bancaria", "corporativo", "securitizacao"],
  },
  {
    id: "renda-variavel",
    label: "Renda variável",
    summary: "Você participa do resultado de um negócio ou de uma carteira de ativos.",
    trait: "Não há valor de resgate contratado; o preço se forma na negociação.",
    accent: "#8FBCC2",
    familyIds: ["acoes", "listados", "participacoes"],
  },
  {
    id: "internacional",
    label: "Internacional",
    summary: "Exposição a ativos de fora do Brasil, por três caminhos diferentes.",
    trait: "O resultado depende do ativo lá fora e também da variação do câmbio.",
    accent: "#94A7C4",
    familyIds: ["recibos", "exterior", "cambial"],
  },
  {
    id: "fundos",
    label: "Fundos",
    summary: "Vários investidores dividem uma carteira administrada por um gestor.",
    trait: "O que a carteira pode conter e quanto custa está no regulamento.",
    accent: "#C9954A",
    familyIds: ["abertos", "creditorios"],
  },
  {
    id: "previdencia",
    label: "Previdência",
    summary: "Acumulação de longo prazo com regras próprias de imposto e sucessão.",
    trait: "Estrutura de seguro, supervisionada pela SUSEP — não pelo FGC.",
    accent: "#6C8E96",
    familyIds: ["previdencia"],
  },
  {
    id: "estruturados",
    label: "Estruturados",
    summary: "Um produto único que combina renda fixa com derivativos.",
    trait: "As regras de pagamento estão no documento da emissão.",
    accent: "#A38FA8",
    familyIds: ["estruturado"],
  },
];

export function familyById(id: string): ProductFamily | null {
  return PRODUCT_FAMILIES.find((family) => family.id === id) ?? null;
}

export function familiesOf(category: Category): ProductFamily[] {
  return category.familyIds
    .map(familyById)
    .filter((family): family is ProductFamily => family !== null);
}

export function classesOf(category: Category): AssetClass[] {
  return familiesOf(category).flatMap((family) => [...family.classes]);
}

export function categoryById(id: string): Category | null {
  return CATEGORIES.find((category) => category.id === id) ?? null;
}

export function familyOf(assetClass: AssetClass): ProductFamily | null {
  return PRODUCT_FAMILIES.find((family) => family.classes.includes(assetClass)) ?? null;
}

export function categoryOfClass(assetClass: AssetClass): Category | null {
  const family = familyOf(assetClass);
  if (!family) return null;
  return CATEGORIES.find((category) => category.familyIds.includes(family.id)) ?? null;
}

export const CATALOGUED_CLASSES: readonly AssetClass[] = PRODUCT_FAMILIES.flatMap(
  (family) => family.classes,
);
