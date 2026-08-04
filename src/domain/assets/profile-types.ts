/**
 * Formato da ficha educativa de um ativo.
 *
 * Este tipo é o principal mecanismo de conformidade do produto. Ele descreve
 * exaustivamente o que o sistema pode dizer sobre um ativo — e a ausência de
 * certos campos é intencional e não deve ser "corrigida":
 *
 *   - não existe campo de rentabilidade, retorno ou histórico de preço;
 *   - não existe nota, score, estrela, ranking ou nível de risco;
 *   - não existe campo de opinião, indicação ou adequação a perfil.
 *
 * Qualquer uma dessas informações exigiria juízo de valor sobre o ativo, o que
 * caracteriza recomendação. Rentabilidade sai daqui por outro motivo: mesmo
 * sendo um dado objetivo, afirmá-la nos tornaria responsáveis pela sua
 * exatidão e atualidade. Por isso ela só aparece como link para fonte oficial,
 * via `officialSources`.
 *
 * Se um campo novo for necessário, ele precisa passar no mesmo teste: descreve
 * uma característica estrutural do *tipo* de ativo, ou emite juízo sobre um
 * ativo específico? Só o primeiro caso entra.
 */

import type { AssetClass } from "./taxonomy";

/** Natureza da garantia associada ao tipo de ativo. */
export type GuaranteeKind =
  | "FGC"
  | "TESOURO_NACIONAL"
  | "GARANTIA_REAL"
  | "SEM_GARANTIA_ESPECIFICA";

export type Guarantee = {
  readonly kind: GuaranteeKind;
  /** Explicação factual da estrutura de garantia. Nunca "seguro" ou "arriscado". */
  readonly description: string;
};

/** Fonte externa oficial para o usuário conferir dados por conta própria. */
export type OfficialSource = {
  readonly label: string;
  readonly url: string;
  /** O que o usuário encontra lá. Ex.: "rentabilidade e histórico do fundo". */
  readonly whatYouFindThere: string;
};

export type AssetProfile = {
  readonly assetClass: AssetClass;
  /** Sigla ou nome curto. Ex.: "CDB". */
  readonly label: string;
  /** Nome por extenso. Ex.: "Certificado de Depósito Bancário". */
  readonly fullName: string;
  /** O que é, em uma frase. */
  readonly summary: string;
  /** Explicação didática do instrumento. */
  readonly whatItIs: string;
  /** Quem pode emitir esse tipo de ativo. */
  readonly issuedBy: string;
  /** Como funciona o resgate / negociação. Descritivo, sem juízo. */
  readonly liquidity: string;
  /** Regra tributária vigente aplicável ao tipo. */
  readonly taxation: string;
  readonly guarantee: Guarantee;
  /** Características estruturais do instrumento. Fatos, não avaliações. */
  readonly characteristics: readonly string[];
  readonly officialSources: readonly OfficialSource[];
};
