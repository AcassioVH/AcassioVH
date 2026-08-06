/**
 * Famílias de produtos, organizadas por QUEM PAGA VOCÊ.
 *
 * Esta é a espinha educacional do site, e a escolha do critério é o conteúdo.
 * A pergunta que separa um produto do outro não é o nome nem a sigla — é de
 * onde sai o dinheiro que volta para você. Um banco, o Tesouro, uma carteira de
 * recebíveis, uma empresa, um condomínio de cotistas, o mercado, uma seguradora.
 *
 * Agrupar por rentabilidade ou por risco seria julgar. Agrupar pela origem do
 * pagamento é descrever a estrutura, que é exatamente o que o serviço faz.
 *
 * A `depth` associa cada família a um nível da escala de profundidade da marca:
 * quanto mais fundo, mais camadas existem entre você e quem efetivamente paga.
 */

import type { AssetClass } from "./taxonomy";

export type ProductFamily = {
  readonly id: string;
  readonly label: string;
  /** Quem, concretamente, paga o investidor. A frase que define a família. */
  readonly whoPays: string;
  /** Explicação curta da estrutura, em uma frase. */
  readonly blurb: string;
  /** Nível na escala de profundidade da marca (1 = mais direto). */
  readonly depth: 1 | 2 | 3 | 4;
  readonly classes: readonly AssetClass[];
};

export const PRODUCT_FAMILIES: readonly ProductFamily[] = [
  {
    id: "soberano",
    label: "Dívida soberana",
    whoPays: "O Tesouro Nacional",
    blurb:
      "Você empresta ao governo federal. É a estrutura com menos intermediários entre " +
      "você e quem paga.",
    depth: 1,
    classes: ["TESOURO_DIRETO"],
  },
  {
    id: "bancaria",
    label: "Renda fixa bancária",
    whoPays: "Uma instituição financeira",
    blurb:
      "Você empresta a um banco, que usa o dinheiro nas próprias operações de crédito. " +
      "É a família coberta pelo FGC.",
    depth: 1,
    classes: ["CDB", "LCI", "LCA", "LC", "POUPANCA"],
  },
  {
    id: "corporativo",
    label: "Crédito privado",
    whoPays: "Uma empresa",
    blurb:
      "Você empresta diretamente a uma companhia. As condições estão na escritura de " +
      "emissão, e o pagamento depende da situação dela.",
    depth: 2,
    classes: ["DEBENTURE"],
  },
  {
    id: "securitizacao",
    label: "Securitização",
    whoPays: "Os devedores de uma carteira de recebíveis",
    blurb:
      "Fluxos futuros de pagamento viram um título negociável. Quem paga não é o banco " +
      "que distribuiu, e sim os devedores originais.",
    depth: 3,
    classes: ["CRI", "CRA"],
  },
  {
    id: "fundos",
    label: "Fundos",
    whoPays: "A carteira do fundo, distribuída entre cotistas",
    blurb:
      "Vários investidores dividem uma carteira administrada por um gestor. O que ela " +
      "pode conter está no regulamento.",
    depth: 3,
    classes: ["FII", "FIAGRO", "ETF", "FUNDO"],
  },
  {
    id: "variavel",
    label: "Renda variável",
    whoPays: "O mercado, quando você vende — e a empresa, quando distribui",
    blurb:
      "Você vira sócio de uma companhia. Não há prazo, não há valor de resgate " +
      "contratado, e o preço se forma na negociação.",
    depth: 2,
    classes: ["ACAO", "BDR"],
  },
  {
    id: "previdencia",
    label: "Previdência",
    whoPays: "Uma seguradora, sob supervisão da SUSEP",
    blurb:
      "Acumulação de longo prazo em estrutura de seguro, com regras próprias de " +
      "tributação e de sucessão.",
    depth: 2,
    classes: ["PREVIDENCIA"],
  },
  {
    id: "estruturado",
    label: "Estruturado",
    whoPays: "O banco emissor, conforme regras montadas com derivativos",
    blurb:
      "Um único produto que empacota renda fixa e derivativos. As regras de pagamento " +
      "estão no documento da emissão.",
    depth: 4,
    classes: ["COE"],
  },
];

/** Família a que uma classe pertence, ou `null` se não estiver catalogada. */
export function familyOf(assetClass: AssetClass): ProductFamily | null {
  return (
    PRODUCT_FAMILIES.find((family) => family.classes.includes(assetClass)) ?? null
  );
}

/** Todas as classes catalogadas, na ordem editorial das famílias. */
export const CATALOGUED_CLASSES: readonly AssetClass[] = PRODUCT_FAMILIES.flatMap(
  (family) => family.classes,
);

export const DEPTH_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Superfície",
  2: "Coluna d'água",
  3: "Zona iluminada",
  4: "Fundo",
};
