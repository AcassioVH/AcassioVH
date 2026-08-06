/**
 * Ponto de entrada da demonstração interativa.
 *
 * Expõe o domínio real — o mesmo classificador, o mesmo catálogo de verbetes e
 * a mesma aritmética de FGC e composição que rodam em produção — para uma
 * página estática, sem servidor nem banco.
 *
 * A regra deste arquivo: ele só reexporta. Nenhuma lógica é reescrita aqui,
 * porque uma demonstração que reimplementa o produto acaba demonstrando outra
 * coisa. Se o classificador mudar, a demonstração muda junto no próximo build.
 *
 * O que a demonstração NÃO cobre, por depender de servidor: autenticação,
 * persistência, criptografia em repouso e envio de e-mail.
 */

import { classifyAsset } from "../src/domain/assets/classify";
import { ASSET_PROFILES, CATALOG_REVIEWED_AT, TAX_NOTICE, profileFor } from "../src/domain/assets/profiles";
import {
  ASSET_CLASSES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  categoryOf,
} from "../src/domain/assets/taxonomy";
import { formatCnpj, isValidCnpj, maskCnpjInput } from "../src/domain/cnpj/cnpj";
import {
  FGC_LIMIT_PER_INSTITUTION_CENTS,
  byCategory,
  byInstitution,
  fgcExposure,
  identificationStatus,
  isFgcCovered,
  maturityCalendar,
  pendingConfirmation,
  statusCounts,
  totalCents,
} from "../src/domain/portfolio/analysis";
import { formatCents, parseCurrencyToCents, shareOf } from "../src/domain/portfolio/money";
import { DISCLAIMER_FULL, DISCLAIMER_SHORT } from "../src/domain/compliance/policy";

const api = {
  classifyAsset,
  profileFor,
  ASSET_PROFILES,
  ASSET_CLASSES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATALOG_REVIEWED_AT,
  TAX_NOTICE,
  categoryOf,
  isValidCnpj,
  maskCnpjInput,
  formatCnpj,
  totalCents,
  byCategory,
  byInstitution,
  fgcExposure,
  maturityCalendar,
  pendingConfirmation,
  statusCounts,
  identificationStatus,
  isFgcCovered,
  FGC_LIMIT_PER_INSTITUTION_CENTS,
  formatCents,
  parseCurrencyToCents,
  shareOf,
  DISCLAIMER_SHORT,
  DISCLAIMER_FULL,
};

declare global {
  interface Window {
    ACASSIUM: typeof api;
  }
}

window.ACASSIUM = api;
