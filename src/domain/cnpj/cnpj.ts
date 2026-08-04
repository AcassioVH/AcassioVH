/**
 * Normalização e validação de CNPJ.
 *
 * O CNPJ é a chave de entrada de todo o sistema, então ele é tratado como um
 * tipo próprio (`Cnpj`) e não como `string` solta: uma vez validado, o resto
 * do domínio pode confiar que o dígito verificador já foi conferido.
 */

/** CNPJ já normalizado (14 dígitos) e com dígito verificador válido. */
export type Cnpj = string & { readonly __brand: "Cnpj" };

const CNPJ_LENGTH = 14;

/** Pesos do cálculo de dígito verificador, conforme a Receita Federal. */
const FIRST_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_DIGIT_WEIGHTS = [6, ...FIRST_DIGIT_WEIGHTS];

/** Remove máscara e espaços, deixando apenas dígitos. */
export function normalizeCnpj(input: string): string {
  return input.replace(/\D/g, "");
}

function checkDigit(digits: readonly number[], weights: readonly number[]): number {
  const sum = weights.reduce((acc, weight, index) => acc + weight * (digits[index] ?? 0), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Valida um CNPJ pelo dígito verificador (módulo 11).
 *
 * Sequências repetidas como 00000000000000 passam no cálculo mas não são
 * CNPJs reais, por isso são rejeitadas explicitamente.
 */
export function isValidCnpj(input: string): boolean {
  const raw = normalizeCnpj(input);

  if (raw.length !== CNPJ_LENGTH) return false;
  if (/^(\d)\1{13}$/.test(raw)) return false;

  const digits = raw.split("").map(Number);
  const first = checkDigit(digits.slice(0, 12), FIRST_DIGIT_WEIGHTS);
  const second = checkDigit(digits.slice(0, 13), SECOND_DIGIT_WEIGHTS);

  return digits[12] === first && digits[13] === second;
}

/** Converte para o tipo `Cnpj`, ou `null` se a entrada for inválida. */
export function parseCnpj(input: string): Cnpj | null {
  return isValidCnpj(input) ? (normalizeCnpj(input) as Cnpj) : null;
}

/** Formata para exibição: 00.000.000/0000-00 */
export function formatCnpj(input: string): string {
  const raw = normalizeCnpj(input).padEnd(CNPJ_LENGTH, "_").slice(0, CNPJ_LENGTH);
  return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12, 14)}`;
}

/** Aplica máscara progressiva enquanto o usuário digita. */
export function maskCnpjInput(input: string): string {
  const raw = normalizeCnpj(input).slice(0, CNPJ_LENGTH);
  const parts = [
    raw.slice(0, 2),
    raw.slice(2, 5),
    raw.slice(5, 8),
    raw.slice(8, 12),
    raw.slice(12, 14),
  ].filter(Boolean);

  let out = parts[0] ?? "";
  if (parts[1]) out += `.${parts[1]}`;
  if (parts[2]) out += `.${parts[2]}`;
  if (parts[3]) out += `/${parts[3]}`;
  if (parts[4]) out += `-${parts[4]}`;
  return out;
}
