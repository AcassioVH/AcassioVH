/**
 * Motor de classificação de ativos.
 *
 * PREMISSA IMPORTANTE, E ELA CONTRARIA A INTUIÇÃO DO BRIEFING:
 *
 * O CNPJ identifica uma *pessoa jurídica*, não um título. Ele resolve muito bem
 * a classificação de fundos — FII, ETF, Fiagro e fundos em geral têm CNPJ
 * próprio e registro consultável na CVM. Mas um CDB não tem CNPJ: quem tem é o
 * banco que o emitiu. O mesmo CNPJ do Banco X aparece em CDB, LCI, LCA e LC
 * daquele banco. Ações e títulos públicos, por sua vez, são identificados por
 * ticker e por código ISIN, não por CNPJ.
 *
 * Logo, "identificar o ativo pelo CNPJ" só funciona sozinho para fundos. Para o
 * resto, a classificação é uma composição de dois sinais: o tipo da entidade por
 * trás do CNPJ e o nome declarado pelo usuário.
 *
 * Como o sistema não pode errar em silêncio, toda classificação carrega uma
 * confiança explícita. Confiança baixa vira pedido de confirmação na interface,
 * nunca um palpite apresentado como fato.
 */

import { parseCnpj, type Cnpj } from "../cnpj/cnpj";
import type { AssetClass } from "./taxonomy";

export type Confidence = "ALTA" | "MEDIA" | "BAIXA";

export type ClassificationInput = {
  /** Nome do ativo como o usuário digitou. Ex.: "CDB Banco Master 2027". */
  readonly declaredName: string;
  /** CNPJ informado, com ou sem máscara. Opcional: ações não têm CNPJ útil. */
  readonly cnpj?: string;
  /** Classe escolhida manualmente pelo usuário, quando houver. Tem precedência. */
  readonly userOverride?: AssetClass;
};

export type Classification = {
  readonly assetClass: AssetClass;
  readonly confidence: Confidence;
  /** Explicação legível de como chegamos aqui. Exibida na interface. */
  readonly rationale: string;
  /** Quando true, a interface pede confirmação ao usuário antes de exibir a ficha. */
  readonly needsUserConfirmation: boolean;
  readonly cnpj: Cnpj | null;
  readonly cnpjIsValid: boolean;
};

type Rule = {
  readonly pattern: RegExp;
  readonly assetClass: AssetClass;
  readonly confidence: Confidence;
  readonly rationale: string;
};

/**
 * Regras de nome, avaliadas em ordem. As mais específicas vêm primeiro para que
 * "fundo de investimento imobiliário" não caia na regra genérica de "fundo".
 */
const NAME_RULES: readonly Rule[] = [
  {
    pattern: /\btesouro\s+(selic|prefixado|ipca|igpm|renda|educa)/i,
    assetClass: "TESOURO_DIRETO",
    confidence: "ALTA",
    rationale: "O nome identifica um título público do Tesouro Direto.",
  },
  {
    pattern: /\b(ltn|ntn-?[bcf]|lft)\b/i,
    assetClass: "TESOURO_DIRETO",
    confidence: "ALTA",
    rationale: "O nome usa a sigla técnica de um título público federal.",
  },
  {
    pattern: /\bfiagro\b/i,
    assetClass: "FIAGRO",
    confidence: "ALTA",
    rationale: "O nome identifica um Fiagro.",
  },
  {
    pattern: /\bfundo\s+de\s+investimento\s+imobili[áa]rio\b|\bfii\b/i,
    assetClass: "FII",
    confidence: "ALTA",
    rationale: "O nome identifica um fundo de investimento imobiliário.",
  },
  {
    pattern: /\betf\b|\bfundo\s+de\s+[íi]ndice\b/i,
    assetClass: "ETF",
    confidence: "ALTA",
    rationale: "O nome identifica um fundo de índice.",
  },
  {
    pattern: /\bcdb\b/i,
    assetClass: "CDB",
    confidence: "ALTA",
    rationale: "O nome identifica um Certificado de Depósito Bancário.",
  },
  {
    pattern: /\blci\b|\bletra\s+de\s+cr[ée]dito\s+imobili[áa]ri/i,
    assetClass: "LCI",
    confidence: "ALTA",
    rationale: "O nome identifica uma Letra de Crédito Imobiliário.",
  },
  {
    pattern: /\blca\b|\bletra\s+de\s+cr[ée]dito\s+do\s+agroneg[óo]ci/i,
    assetClass: "LCA",
    confidence: "ALTA",
    rationale: "O nome identifica uma Letra de Crédito do Agronegócio.",
  },
  {
    pattern: /\bcri\b|\bcertificado\s+de\s+receb[íi]veis\s+imobili[áa]ri/i,
    assetClass: "CRI",
    confidence: "ALTA",
    rationale: "O nome identifica um Certificado de Recebíveis Imobiliários.",
  },
  {
    pattern: /\bcra\b|\bcertificado\s+de\s+receb[íi]veis\s+do\s+agroneg[óo]ci/i,
    assetClass: "CRA",
    confidence: "ALTA",
    rationale: "O nome identifica um Certificado de Recebíveis do Agronegócio.",
  },
  {
    pattern: /\bdeb[êe]ntures?\b|\bdeb\s+inc\b/i,
    assetClass: "DEBENTURE",
    confidence: "ALTA",
    rationale: "O nome identifica uma debênture.",
  },
  {
    pattern: /\bcoe\b|\boperaç[õo]es\s+estruturadas\b/i,
    assetClass: "COE",
    confidence: "ALTA",
    rationale: "O nome identifica um Certificado de Operações Estruturadas.",
  },
  {
    pattern: /\b(pgbl|vgbl)\b|\bprevid[êe]ncia\b/i,
    assetClass: "PREVIDENCIA",
    confidence: "ALTA",
    rationale: "O nome identifica um plano de previdência privada.",
  },
  {
    pattern: /\bletra\s+de\s+c[âa]mbio\b|\blc\b/i,
    assetClass: "LC",
    confidence: "MEDIA",
    rationale: "O nome sugere uma Letra de Câmbio, mas a sigla LC é ambígua.",
  },
  {
    pattern: /\bpoupan[çc]a\b/i,
    assetClass: "POUPANCA",
    confidence: "ALTA",
    rationale: "O nome identifica a caderneta de poupança.",
  },
  {
    pattern: /\bfundo\s+de\s+investimento\b|\bfi[cm]?\s+(rf|multimercado|a[çc][õo]es)\b/i,
    assetClass: "FUNDO",
    confidence: "MEDIA",
    rationale: "O nome identifica um fundo de investimento, sem indicar a subcategoria.",
  },
];

/** Tickers de fundos listados (FII, Fiagro e boa parte dos ETFs) terminam em 11. */
const TICKER_FUND = /^[A-Z]{4}11B?$/;
/** Ações ordinárias, preferenciais e units seguem letra + dígito de 3 a 8. */
const TICKER_STOCK = /^[A-Z]{4}[3-8]$/;
/** BDRs não patrocinados terminam em 34; patrocinados variam entre 31 e 35. */
const TICKER_BDR = /^[A-Z]{4}3[1-5]$/;

function classifyByTicker(name: string): Rule | null {
  const token = name.trim().toUpperCase();

  if (TICKER_BDR.test(token)) {
    return {
      pattern: TICKER_BDR,
      assetClass: "BDR",
      confidence: "MEDIA",
      rationale: "O código informado segue o padrão de ticker de BDR.",
    };
  }
  if (TICKER_FUND.test(token)) {
    return {
      pattern: TICKER_FUND,
      assetClass: "FII",
      confidence: "BAIXA",
      rationale:
        "O código termina em 11, padrão compartilhado por FIIs, Fiagros, ETFs e units. " +
        "Confirme o tipo para exibirmos a ficha correta.",
    };
  }
  if (TICKER_STOCK.test(token)) {
    return {
      pattern: TICKER_STOCK,
      assetClass: "ACAO",
      confidence: "MEDIA",
      rationale: "O código informado segue o padrão de ticker de ação negociada na B3.",
    };
  }
  return null;
}

/**
 * Classifica um ativo a partir do nome declarado e, quando houver, do CNPJ.
 *
 * A classificação nunca é apresentada como certeza quando não é: `confidence` e
 * `needsUserConfirmation` existem para que a interface possa ser honesta sobre
 * o que sabe e o que apenas suspeita.
 */
export function classifyAsset(input: ClassificationInput): Classification {
  const cnpj = input.cnpj ? parseCnpj(input.cnpj) : null;
  const cnpjIsValid = input.cnpj ? cnpj !== null : true;
  const name = input.declaredName.trim();

  if (input.userOverride) {
    return {
      assetClass: input.userOverride,
      confidence: "ALTA",
      rationale: "Classificação definida manualmente por você.",
      needsUserConfirmation: false,
      cnpj,
      cnpjIsValid,
    };
  }

  const matched = NAME_RULES.find((rule) => rule.pattern.test(name)) ?? classifyByTicker(name);

  if (!matched) {
    return {
      assetClass: "NAO_CLASSIFICADO",
      confidence: "BAIXA",
      rationale:
        "Não identificamos o tipo do ativo pelo nome informado. Você pode selecionar a " +
        "classificação manualmente.",
      needsUserConfirmation: true,
      cnpj,
      cnpjIsValid,
    };
  }

  // Um CNPJ inválido não invalida a classificação por nome, mas derruba a
  // confiança: sem entidade confirmada, não há como cruzar os dois sinais.
  const confidence: Confidence = cnpjIsValid
    ? matched.confidence
    : matched.confidence === "ALTA"
      ? "MEDIA"
      : "BAIXA";

  const rationale = cnpjIsValid
    ? matched.rationale
    : `${matched.rationale} O CNPJ informado não passou na validação de dígito verificador, ` +
      "então não conseguimos confirmar a instituição.";

  return {
    assetClass: matched.assetClass,
    confidence,
    rationale,
    needsUserConfirmation: confidence === "BAIXA",
    cnpj,
    cnpjIsValid,
  };
}
