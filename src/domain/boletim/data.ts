/**
 * As datas do boletim, num fuso só.
 *
 * O servidor roda em UTC e o leitor está em Alagoas. Sem fixar o fuso, um
 * boletim apurado às 22h de terça é carimbado como quarta-feira, e o prompt
 * pede notícia "das últimas 48 horas" contando a partir do dia errado.
 *
 * Vive no domínio, e não junto do prompt, porque as duas pontas precisam da
 * mesma resposta: o servidor para montar o pedido, a tela para carimbar o
 * cabeçalho. Duas implementações divergiriam no primeiro fim de dia.
 */

const FUSO = "America/Maceio";

/** "quarta-feira, 12 de agosto de 2026" — o cabeçalho e o prompt usam a mesma linha. */
export function dataExtenso(agora: Date = new Date()): string {
  return agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: FUSO,
  });
}

/** "14:37" — a hora em que a apuração terminou. */
export function horaCurta(agora: Date = new Date()): string {
  return agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  });
}
