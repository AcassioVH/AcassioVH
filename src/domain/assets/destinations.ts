/**
 * A arquitetura de navegação do site, em dois níveis.
 *
 *   CATEGORIA (renda fixa, renda variável, internacional…) — o vocabulário que
 *   o visitante já tem quando chega.
 *
 *   DESTINO (o Tesouro Nacional, uma instituição financeira, uma carteira de
 *   recebíveis…) — o corte por PARA ONDE VAI O SEU DINHEIRO, que é o que de
 *   fato distingue um produto do outro.
 *
 * A categoria é a porta; o destino é a explicação. Entrar por "renda fixa" e
 * descobrir que ali dentro o dinheiro vai para quatro lugares diferentes — o
 * Tesouro, um banco, uma empresa e uma carteira de recebíveis — é o momento em
 * que o site ensina alguma coisa.
 *
 * **O nível se chamava "família", e o nome saiu.** "Renda fixa · 4 famílias ·
 * 14 produtos" obrigava o leitor a aprender uma metáfora antes de aprender o
 * assunto: família de quê, agrupada por qual critério? "4 destinos" responde a
 * pergunta no próprio substantivo, e diz a mesma coisa que a ficha de cada
 * produto já dizia na linha "Destino:". O site inteiro passa a falar uma
 * palavra só.
 *
 * `chain` é o caminho do seu dinheiro, e vira diagrama na tela.
 *
 * **A direção era a inversa, e foi corrigida.** O diagrama começava no pagador
 * final e terminava em "Você", descrevendo o pagamento voltando. Estava certo
 * como fato e errado como leitura: quem chega numa página de investimento
 * pensa primeiro no dinheiro que sai da mão dele, não no que volta. Começar por
 * "Você" põe o leitor no primeiro elo, que é onde ele de fato está quando
 * decide. O retorno continua descrito — em `target`, e no verbete.
 *
 * É estrutura pura: descreve o caminho do dinheiro, sem dizer se o caminho é bom.
 */

import type { AssetClass } from "./taxonomy";

export type Destination = {
  readonly id: string;
  /** Como o destino se chama. Ex.: "Renda fixa bancária". */
  readonly label: string;
  /** Onde o dinheiro efetivamente para. Ex.: "Uma instituição financeira". */
  readonly target: string;
  /** Uma frase. Nada além disso — o detalhe vive no verbete. */
  readonly blurb: string;
  /** O caminho do dinheiro, de você até o destino final. Vira diagrama. */
  readonly chain: readonly string[];
  readonly classes: readonly AssetClass[];
};

export const DESTINATIONS: readonly Destination[] = [
  {
    id: "soberano",
    label: "Dívida soberana",
    target: "O Tesouro Nacional",
    blurb: "Você empresta ao governo federal.",
    chain: ["Você", "Tesouro Nacional"],
    classes: ["TESOURO_DIRETO"],
  },
  {
    id: "bancaria",
    label: "Renda fixa bancária",
    target: "Uma instituição financeira",
    blurb: "Você empresta a um banco. É o destino em que mora a cobertura do FGC.",
    chain: ["Você", "Banco emissor", "Tomadores de crédito"],
    classes: ["CDB", "RDB", "LCI", "LCA", "LC", "LF", "LIG", "DPGE", "POUPANCA"],
  },
  {
    id: "corporativo",
    label: "Crédito privado",
    target: "Uma empresa",
    blurb: "Você empresta direto a uma companhia, sem banco no meio.",
    chain: ["Você", "Empresa emissora"],
    classes: ["DEBENTURE"],
  },
  {
    id: "securitizacao",
    label: "Securitização",
    target: "Uma carteira de recebíveis",
    blurb: "Pagamentos futuros viram um título negociável.",
    chain: ["Você", "Securitizadora", "Devedores dos recebíveis"],
    classes: ["CRI", "CRA", "CDCA"],
  },
  {
    id: "acoes",
    label: "Participação societária",
    target: "O capital de uma companhia aberta",
    blurb: "Você vira sócio. Não há prazo nem valor de resgate contratado.",
    chain: ["Você", "Mercado", "Empresa"],
    classes: ["ACAO", "UNIT"],
  },
  {
    id: "listados",
    label: "Fundos listados",
    target: "A carteira de um fundo negociado em bolsa",
    blurb: "Cotas negociadas em bolsa, com carteira definida em regulamento.",
    chain: ["Você (cotista)", "Fundo", "Ativos da carteira"],
    classes: ["FII", "FIAGRO", "ETF", "FI_INFRA"],
  },
  {
    id: "participacoes",
    label: "Participação em empresas fechadas",
    target: "O capital de empresas fechadas",
    blurb: "O fundo compra parte de companhias fechadas e participa da gestão delas.",
    chain: ["Você (cotista)", "Fundo", "Empresas investidas"],
    classes: ["FIP"],
  },
  {
    id: "recibos",
    label: "Listado aqui, lastro lá fora",
    target: "Um ativo no exterior, via estrutura brasileira",
    blurb: "Você negocia em reais, na B3, um papel que representa algo de fora.",
    chain: ["Você", "Estrutura brasileira", "Empresa no exterior"],
    classes: ["BDR", "ETF_INTERNACIONAL"],
  },
  {
    id: "exterior",
    label: "Direto no exterior",
    target: "Um emissor estrangeiro, na moeda dele",
    blurb: "Conta fora do país, ativo original, regulação do país de origem.",
    chain: ["Você", "Corretora no exterior", "Emissor no exterior"],
    classes: ["ACAO_EXTERIOR", "REIT", "BOND_EXTERIOR"],
  },
  {
    id: "cambial",
    label: "Exposição cambial",
    target: "Uma moeda estrangeira, por meio de um fundo",
    blurb: "Aplicação em reais que acompanha a variação de uma moeda estrangeira.",
    chain: ["Você (cotista)", "Fundo cambial", "Moeda estrangeira"],
    classes: ["FUNDO_CAMBIAL"],
  },
  {
    id: "abertos",
    label: "Fundos abertos",
    target: "A carteira de um fundo aberto",
    blurb: "Aplicação e resgate com o próprio fundo, nos prazos do regulamento.",
    chain: ["Você (cotista)", "Gestor", "Ativos da carteira"],
    classes: ["FUNDO", "FUNDO_RENDA_FIXA", "FUNDO_MULTIMERCADO", "FUNDO_ACOES"],
  },
  {
    id: "creditorios",
    label: "Fundos de recebíveis",
    target: "Uma carteira de créditos a receber",
    blurb: "A carteira é feita de dívidas de terceiros a receber.",
    chain: ["Você (cotista)", "Fundo", "Devedores dos créditos"],
    classes: ["FIDC"],
  },
  {
    id: "previdencia",
    label: "Previdência",
    target: "Uma seguradora, sob supervisão da SUSEP",
    blurb: "Acumulação de longo prazo em estrutura de seguro.",
    chain: ["Você", "Seguradora", "Carteira do plano"],
    classes: ["PREVIDENCIA", "PGBL", "VGBL"],
  },
  {
    id: "estruturado",
    label: "Estruturado",
    target: "Um banco emissor, em estrutura com derivativos",
    blurb: "Renda fixa e derivativos empacotados num produto só.",
    chain: ["Você", "Banco emissor", "Ativo de referência"],
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
  readonly destinationIds: readonly string[];
};

/**
 * As categorias, na ordem em que aparecem na home.
 *
 * O vocabulário é o que o visitante já traz — "renda fixa", "renda variável",
 * "internacional". A promessa da categoria é sempre a mesma: em uma frase, o
 * que é; e, ao entrar, para onde vai o dinheiro em cada coisa lá dentro.
 */
export const CATEGORIES: readonly Category[] = [
  {
    id: "renda-fixa",
    label: "Renda fixa",
    summary: "Você empresta dinheiro e há uma regra de devolução combinada desde o início.",
    trait: "A remuneração é conhecida em fórmula, e há prazo definido.",
    accent: "#E3BC7E",
    destinationIds: ["soberano", "bancaria", "corporativo", "securitizacao"],
  },
  {
    id: "renda-variavel",
    label: "Renda variável",
    summary: "Você participa do resultado de um negócio ou de uma carteira de ativos.",
    trait: "Não há valor de resgate contratado; o preço se forma na negociação.",
    accent: "#8FBCC2",
    destinationIds: ["acoes", "listados", "participacoes"],
  },
  {
    id: "internacional",
    label: "Internacional",
    summary: "Exposição a ativos de fora do Brasil, por três caminhos diferentes.",
    trait: "O resultado depende do ativo lá fora e também da variação do câmbio.",
    accent: "#94A7C4",
    destinationIds: ["recibos", "exterior", "cambial"],
  },
  {
    id: "fundos",
    label: "Fundos",
    summary: "Vários investidores dividem uma carteira administrada por um gestor.",
    trait: "O que a carteira pode conter e quanto custa está no regulamento.",
    accent: "#C9954A",
    destinationIds: ["abertos", "creditorios"],
  },
  {
    id: "previdencia",
    label: "Previdência",
    summary: "Acumulação de longo prazo com regras próprias de imposto e sucessão.",
    trait: "Estrutura de seguro, supervisionada pela SUSEP — não pelo FGC.",
    accent: "#6C8E96",
    destinationIds: ["previdencia"],
  },
  {
    id: "estruturados",
    label: "Estruturados",
    summary: "Um produto único que combina renda fixa com derivativos.",
    trait: "As regras de pagamento estão no documento da emissão.",
    accent: "#A38FA8",
    destinationIds: ["estruturado"],
  },
];

export function destinationById(id: string): Destination | null {
  return DESTINATIONS.find((destination) => destination.id === id) ?? null;
}

export function destinationsOf(category: Category): Destination[] {
  return category.destinationIds
    .map(destinationById)
    .filter((destination): destination is Destination => destination !== null);
}

export function classesOf(category: Category): AssetClass[] {
  return destinationsOf(category).flatMap((destination) => [...destination.classes]);
}

export function categoryById(id: string): Category | null {
  return CATEGORIES.find((category) => category.id === id) ?? null;
}

export function destinationOf(assetClass: AssetClass): Destination | null {
  return DESTINATIONS.find((destination) => destination.classes.includes(assetClass)) ?? null;
}

export function categoryOfClass(assetClass: AssetClass): Category | null {
  const destination = destinationOf(assetClass);
  if (!destination) return null;
  return CATEGORIES.find((category) => category.destinationIds.includes(destination.id)) ?? null;
}

export const CATALOGUED_CLASSES: readonly AssetClass[] = DESTINATIONS.flatMap(
  (destination) => destination.classes,
);
