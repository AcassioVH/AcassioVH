/**
 * Leitura estrutural da carteira.
 *
 * Tudo aqui é aritmética sobre o que o usuário declarou: somar, agrupar,
 * ordenar por data. Nenhuma função avalia o resultado.
 *
 * A distinção é fina e vale enunciar, porque é ela que mantém o produto dentro
 * da exceção da CVM 19: dizer "você tem R$ 300 mil em uma instituição, e a
 * cobertura do FGC por instituição é de R$ 250 mil" é descrever dois fatos
 * verificáveis. Dizer "você está concentrado demais" é avaliar. O primeiro é
 * função deste módulo; o segundo não existe no sistema.
 */

import { categoryOf, type AssetCategory, type AssetClass } from "../assets/taxonomy";
import { shareOf } from "./money";

/** Ativo já normalizado para leitura. Espelha o que está no banco. */
export type PortfolioAsset = {
  readonly id: string;
  readonly name: string;
  readonly cnpj: string | null;
  readonly institution: string | null;
  readonly valueCents: number;
  readonly assetClass: AssetClass;
  readonly confidence: string;
  readonly classConfirmedByUser: boolean;
  readonly maturityDate: Date | null;
};

export function totalCents(assets: readonly PortfolioAsset[]): number {
  return assets.reduce((sum, asset) => sum + asset.valueCents, 0);
}

export type CategorySlice = {
  readonly category: AssetCategory;
  readonly valueCents: number;
  readonly share: number;
  readonly assetCount: number;
};

/** Composição por categoria, da maior participação para a menor. */
export function byCategory(assets: readonly PortfolioAsset[]): CategorySlice[] {
  const total = totalCents(assets);
  const buckets = new Map<AssetCategory, { valueCents: number; assetCount: number }>();

  for (const asset of assets) {
    const category = categoryOf(asset.assetClass);
    const bucket = buckets.get(category) ?? { valueCents: 0, assetCount: 0 };
    bucket.valueCents += asset.valueCents;
    bucket.assetCount += 1;
    buckets.set(category, bucket);
  }

  return [...buckets.entries()]
    .map(([category, bucket]) => ({
      category,
      valueCents: bucket.valueCents,
      share: shareOf(bucket.valueCents, total),
      assetCount: bucket.assetCount,
    }))
    .sort((a, b) => b.valueCents - a.valueCents);
}

export type ClassSlice = {
  readonly assetClass: AssetClass;
  readonly valueCents: number;
  readonly share: number;
  readonly assetCount: number;
};

export function byClass(assets: readonly PortfolioAsset[]): ClassSlice[] {
  const total = totalCents(assets);
  const buckets = new Map<AssetClass, { valueCents: number; assetCount: number }>();

  for (const asset of assets) {
    const bucket = buckets.get(asset.assetClass) ?? { valueCents: 0, assetCount: 0 };
    bucket.valueCents += asset.valueCents;
    bucket.assetCount += 1;
    buckets.set(asset.assetClass, bucket);
  }

  return [...buckets.entries()]
    .map(([assetClass, bucket]) => ({
      assetClass,
      valueCents: bucket.valueCents,
      share: shareOf(bucket.valueCents, total),
      assetCount: bucket.assetCount,
    }))
    .sort((a, b) => b.valueCents - a.valueCents);
}

export const UNSPECIFIED_INSTITUTION = "Não informada";

export type InstitutionSlice = {
  readonly institution: string;
  readonly valueCents: number;
  readonly share: number;
  readonly assetCount: number;
};

export function byInstitution(assets: readonly PortfolioAsset[]): InstitutionSlice[] {
  const total = totalCents(assets);
  const buckets = new Map<string, { valueCents: number; assetCount: number }>();

  for (const asset of assets) {
    const key = asset.institution?.trim() || UNSPECIFIED_INSTITUTION;
    const bucket = buckets.get(key) ?? { valueCents: 0, assetCount: 0 };
    bucket.valueCents += asset.valueCents;
    bucket.assetCount += 1;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .map(([institution, bucket]) => ({
      institution,
      valueCents: bucket.valueCents,
      share: shareOf(bucket.valueCents, total),
      assetCount: bucket.assetCount,
    }))
    .sort((a, b) => b.valueCents - a.valueCents);
}

/**
 * Limite de cobertura do FGC por CPF e por instituição, em centavos.
 *
 * Valor vigente conhecido na curadoria. É parâmetro de norma e pode mudar, por
 * isso a interface sempre exibe junto o link para o FGC — mesma regra que
 * aplicamos a tributação e rentabilidade: o número oficial é de quem tem
 * autoridade para publicá-lo.
 */
export const FGC_LIMIT_PER_INSTITUTION_CENTS = 250_000_00;

/** Classes cobertas pelo FGC. Deriva da natureza do instrumento, não do emissor. */
const FGC_COVERED_CLASSES: ReadonlySet<AssetClass> = new Set<AssetClass>([
  "CDB",
  "LCI",
  "LCA",
  "LC",
  "POUPANCA",
]);

export function isFgcCovered(assetClass: AssetClass): boolean {
  return FGC_COVERED_CLASSES.has(assetClass);
}

export type FgcExposure = {
  readonly institution: string;
  /** Soma dos ativos de tipos cobertos pelo FGC nessa instituição. */
  readonly coveredValueCents: number;
  /** Quanto excede o limite por instituição. Zero quando não excede. */
  readonly aboveLimitCents: number;
  readonly assetCount: number;
};

/**
 * Exposição por instituição considerando apenas ativos de tipos cobertos.
 *
 * `aboveLimitCents` é subtração, não julgamento: informa quanto do declarado
 * está além do teto de cobertura. O que fazer com essa informação é do usuário.
 */
export function fgcExposure(assets: readonly PortfolioAsset[]): FgcExposure[] {
  const buckets = new Map<string, { coveredValueCents: number; assetCount: number }>();

  for (const asset of assets) {
    if (!isFgcCovered(asset.assetClass)) continue;

    const key = asset.institution?.trim() || UNSPECIFIED_INSTITUTION;
    const bucket = buckets.get(key) ?? { coveredValueCents: 0, assetCount: 0 };
    bucket.coveredValueCents += asset.valueCents;
    bucket.assetCount += 1;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .map(([institution, bucket]) => ({
      institution,
      coveredValueCents: bucket.coveredValueCents,
      aboveLimitCents: Math.max(
        0,
        bucket.coveredValueCents - FGC_LIMIT_PER_INSTITUTION_CENTS,
      ),
      assetCount: bucket.assetCount,
    }))
    .sort((a, b) => b.coveredValueCents - a.coveredValueCents);
}

export type MaturityEntry = {
  readonly asset: PortfolioAsset;
  readonly maturityDate: Date;
  readonly daysUntil: number;
};

/**
 * Calendário de vencimentos, do mais próximo ao mais distante.
 *
 * Ativos sem vencimento (ação, FII, fundo aberto) simplesmente não entram —
 * não têm data, e inventar uma seria pior que omitir.
 */
export function maturityCalendar(
  assets: readonly PortfolioAsset[],
  reference: Date = new Date(),
): MaturityEntry[] {
  const startOfReference = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate(),
  );

  return assets
    .filter((asset): asset is PortfolioAsset & { maturityDate: Date } => asset.maturityDate !== null)
    .map((asset) => {
      const maturity = asset.maturityDate;
      const startOfMaturity = Date.UTC(
        maturity.getUTCFullYear(),
        maturity.getUTCMonth(),
        maturity.getUTCDate(),
      );

      return {
        asset,
        maturityDate: maturity,
        daysUntil: Math.round((startOfMaturity - startOfReference) / 86_400_000),
      };
    })
    .sort((a, b) => a.maturityDate.getTime() - b.maturityDate.getTime());
}

/**
 * Estado de identificação de um ativo.
 *
 * É sobre o quanto sabemos do ativo, nunca sobre o mérito dele. Um ativo
 * "não classificado" não é pior que outro — só ainda não foi reconhecido.
 *
 * O sistema de marca exige que estado seja comunicado por cor MAIS palavra,
 * então cada valor aqui carrega o rótulo que aparece na tela.
 */
export type IdentificationStatus = {
  readonly tone: "identified" | "preparing" | "missing";
  readonly label: string;
};

export function identificationStatus(asset: PortfolioAsset): IdentificationStatus {
  if (asset.assetClass === "NAO_CLASSIFICADO") {
    return { tone: "missing", label: "NÃO CLASSIFICADO" };
  }
  if (asset.classConfirmedByUser || asset.confidence === "ALTA") {
    return { tone: "identified", label: "IDENTIFICADO" };
  }
  return { tone: "preparing", label: "A CONFIRMAR" };
}

/** Contagem por estado, para os marcadores do topo do painel. */
export function statusCounts(assets: readonly PortfolioAsset[]) {
  let identified = 0;
  let preparing = 0;
  let missing = 0;

  for (const asset of assets) {
    const { tone } = identificationStatus(asset);
    if (tone === "identified") identified += 1;
    else if (tone === "preparing") preparing += 1;
    else missing += 1;
  }

  return { identified, preparing, missing };
}

/**
 * Ativos que ainda pedem confirmação do usuário.
 *
 * Derivada de `identificationStatus` de propósito. Antes as duas funções
 * decidiam o mesmo por critérios diferentes, e o painel exibia "2 a confirmar"
 * enquanto oferecia um único ativo para confirmar — o contador dizia uma coisa
 * e a lista, outra. Com uma fonte única, isso não volta a acontecer.
 */
export function pendingConfirmation(
  assets: readonly PortfolioAsset[],
): PortfolioAsset[] {
  return assets.filter((asset) => identificationStatus(asset).tone !== "identified");
}
