/**
 * Dinheiro em centavos inteiros.
 *
 * Nunca use float para valor monetário: 0.1 + 0.2 não dá 0.3 em ponto
 * flutuante, e num total de carteira isso vira centavo perdido que o usuário
 * percebe. Todo valor circula como inteiro de centavos e só vira texto na
 * borda da interface.
 */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos para exibição. Ex.: 1234567 → "R$ 12.345,67". */
export function formatCents(cents: number): string {
  return BRL.format(cents / 100);
}

/**
 * Converte texto digitado pelo usuário em centavos.
 *
 * Aceita as formas que uma pessoa realmente digita em português: "1.234,56",
 * "1234,56", "1234.56" e "1234". A regra de desempate entre ponto e vírgula é
 * o último separador encontrado — em "1.234,56" a vírgula é decimal, em
 * "1,234.56" é o ponto.
 *
 * Devolve `null` para entrada que não representa um valor, para que a
 * validação decida a mensagem em vez de recebermos NaN silencioso.
 */
export function parseCurrencyToCents(input: string): number | null {
  const trimmed = input.trim().replace(/^R\$\s*/i, "");
  if (trimmed === "") return null;
  if (!/^[\d.,\s]+$/.test(trimmed)) return null;

  const cleaned = trimmed.replace(/\s/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : lastDot > lastComma ? "." : null;

  let integerPart: string;
  let decimalPart = "";

  if (decimalSeparator === null) {
    integerPart = cleaned;
  } else {
    const index = cleaned.lastIndexOf(decimalSeparator);
    const fraction = cleaned.slice(index + 1);

    // Mais de duas casas depois do separador significa que ele era de milhar,
    // não decimal: "1.234" são mil duzentos e trinta e quatro reais.
    if (fraction.length > 2 || fraction.length === 0) {
      integerPart = cleaned;
    } else {
      integerPart = cleaned.slice(0, index);
      decimalPart = fraction;
    }
  }

  const digits = integerPart.replace(/[.,]/g, "");
  if (digits === "" || !/^\d+$/.test(digits)) return null;

  const cents = Number(digits) * 100 + Number(decimalPart.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Participação percentual, com uma casa decimal. Devolve 0 quando o total é 0. */
export function shareOf(valueCents: number, totalCents: number): number {
  if (totalCents <= 0) return 0;
  return Math.round((valueCents / totalCents) * 1000) / 10;
}
