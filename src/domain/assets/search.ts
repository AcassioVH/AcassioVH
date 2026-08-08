/**
 * O índice de busca.
 *
 * Derivado do catálogo, nunca escrito à mão: um índice paralelo envelheceria na
 * primeira ficha nova, e o defeito seria invisível — o produto existiria no site
 * e sumiria da busca.
 *
 * O casamento é por prefixo de palavra, e não por substring solta. "ca" precisa
 * achar "CDB" e "Caderneta", mas não pode achar "Bancária" pelo meio da
 * palavra: resultado que aparece sem o usuário entender por quê corrói a
 * confiança na busca inteira.
 *
 * Sem biblioteca. São 42 registros — um índice invertido aqui custaria mais em
 * bytes baixados do que economiza em comparações.
 */

import { CATEGORIES, CATALOGUED_CLASSES, categoryOfClass, familyOf } from "./families";
import { profileFor } from "./profiles";
import type { AssetClass } from "./taxonomy";

export type SearchEntry = {
  readonly kind: "produto" | "categoria";
  readonly id: string;
  readonly href: string;
  /** O que aparece grande no resultado. */
  readonly title: string;
  /** A sigla, quando existe — é por ela que a maioria procura. */
  readonly badge: string | null;
  /** Uma linha de contexto. */
  readonly detail: string;
  readonly accent: string;
  /** Tudo que casa, já normalizado. Não é exibido. */
  readonly haystack: readonly string[];
};

/** Tira acento e caixa: quem digita "cambio" precisa achar "câmbio". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Quebra texto em palavras buscáveis.
 *
 * Usada **tanto no índice quanto na consulta**, e é obrigatório que seja a
 * mesma: enquanto o índice quebrava em não-alfanuméricos e a consulta só em
 * espaço, "FI-Infra" virava um termo único que não casava com "fi" nem com
 * "infra" — o produto existia no site e sumia da busca. Travessão em
 * "Títulos Públicos Federais — Tesouro Direto" falhava pelo mesmo motivo.
 */
function palavras(...textos: (string | null | undefined)[]): string[] {
  return textos
    .filter((t): t is string => Boolean(t))
    .flatMap((t) => normalize(t).split(/[^a-z0-9+]+/))
    .filter((p) => p.length > 0);
}

/**
 * O vocabulário que a pessoa usa, e que o catálogo não usa.
 *
 * Quem quer exposição em moeda estrangeira digita "dólar" — o verbete se chama
 * "Fundo cambial". Quem quer ações lá fora digita "exterior" ou "eua". Não é
 * conteúdo novo nem opinião: é a ponte entre a palavra do leitor e o nome
 * técnico do instrumento, que é exatamente o serviço que o site presta.
 *
 * A lista é curta de propósito. Sinônimo demais devolve resultado que a pessoa
 * não pediu, e uma busca que erra ensina a não usar a busca.
 */
const SINONIMOS: Readonly<Record<string, readonly string[]>> = {
  FUNDO_CAMBIAL: ["dolar", "cambio", "moeda", "estrangeira"],
  ETF_INTERNACIONAL: ["dolar", "sp500", "exterior", "global", "indice"],
  ACAO_EXTERIOR: ["exterior", "eua", "stocks", "nasdaq", "estrangeira"],
  BOND_EXTERIOR: ["treasury", "treasuries", "exterior", "divida"],
  REIT: ["imovel", "imobiliario", "exterior", "eua"],
  BDR: ["exterior", "estrangeira", "recibo"],
  TESOURO_DIRETO: ["selic", "ipca", "prefixado", "publico", "governo"],
  POUPANCA: ["caderneta"],
  FII: ["imovel", "imobiliario", "aluguel"],
  PREVIDENCIA: ["aposentadoria", "pgbl", "vgbl"],
  PGBL: ["aposentadoria", "deducao"],
  VGBL: ["aposentadoria", "sucessao"],
  DEBENTURE: ["incentivada", "infraestrutura"],
  ACAO: ["bolsa", "acoes", "socio", "dividendo"],
  UNIT: ["bolsa", "acoes"],
  FIDC: ["recebiveis", "credito"],
  FIP: ["private", "equity", "venture"],
  COE: ["estruturado", "derivativo"],
  LCI: ["imobiliario", "isento"],
  LCA: ["agro", "isento"],
  CRI: ["imobiliario", "isento"],
  CRA: ["agro", "isento"],
};

function entradaDeProduto(assetClass: AssetClass): SearchEntry {
  const profile = profileFor(assetClass);
  const family = familyOf(assetClass);
  const category = categoryOfClass(assetClass);

  return {
    kind: "produto",
    id: assetClass,
    href: `/produtos/${assetClass}`,
    title: profile.fullName,
    badge: profile.label === profile.fullName ? null : profile.label,
    detail: family ? `Paga você: ${family.whoPays}` : (category?.label ?? "Produto"),
    accent: category?.accent ?? "var(--color-light)",
    haystack: [
      // A sigla inteira entra também sem quebra, para "TESOURO_DIRETO" casar
      // com quem digita "tesouro" e com quem digita a classe crua.
      normalize(assetClass.replace(/_/g, " ")),
      ...(SINONIMOS[assetClass] ?? []),
      ...palavras(
        profile.label,
        profile.fullName,
        profile.summary,
        family?.label,
        family?.whoPays,
        category?.label,
      ),
    ],
  };
}

export const SEARCH_INDEX: readonly SearchEntry[] = [
  ...CATEGORIES.map(
    (category): SearchEntry => ({
      kind: "categoria",
      id: category.id,
      href: `/categorias/${category.id}`,
      title: category.label,
      badge: null,
      detail: category.summary,
      accent: category.accent,
      haystack: palavras(category.label, category.summary, category.trait),
    }),
  ),
  ...CATALOGUED_CLASSES.map(entradaDeProduto),
];

/**
 * Busca por prefixo, com todos os termos obrigatórios.
 *
 * Exigir que *cada* termo digitado case com alguma palavra do registro é o que
 * faz "cra agro" ser mais preciso que "cra" — a busca estreita conforme a pessoa
 * escreve, que é o comportamento que ela espera.
 *
 * A ordenação é por qualidade do casamento, nunca por mérito do produto:
 * primeiro quem bate na sigla, depois quem bate no começo do nome, depois o
 * resto. Categorias vêm antes de produtos em empate porque são o degrau mais
 * geral — quem procura "renda fixa" quer a porta, não um dos catorze verbetes.
 */
export function search(query: string, limite = 8): SearchEntry[] {
  // A consulta passa pela mesma quebra do índice — ver `palavras`.
  const termos = palavras(query);
  if (termos.length === 0) return [];

  const pontuados: { entry: SearchEntry; score: number }[] = [];

  for (const entry of SEARCH_INDEX) {
    let score = 0;
    const casaTudo = termos.every((termo) => {
      const acerto = entry.haystack.some((palavra) => palavra.startsWith(termo));
      if (!acerto) return false;

      // Sigla idêntica ganha de sigla que só começa igual: quem digita "ETF"
      // quer o ETF, não o "ETF internacional" — que também começa com ETF.
      const sigla = entry.badge ? normalize(entry.badge) : null;
      if (sigla === termo) score += 400;
      else if (sigla?.startsWith(termo)) score += 100;
      if (normalize(entry.title).startsWith(termo)) score += 50;
      if (entry.haystack.some((p) => p === termo)) score += 20;
      return true;
    });

    if (!casaTudo) continue;
    if (entry.kind === "categoria") score += 10;
    // Título curto casa mais "de perto" que título longo com a mesma pontuação.
    score -= entry.title.length / 100;
    pontuados.push({ entry, score });
  }

  return pontuados
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
    .map((p) => p.entry);
}
