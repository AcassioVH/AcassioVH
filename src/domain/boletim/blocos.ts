/**
 * As etapas do boletim.
 *
 * Duas listas, e elas não coincidem por um motivo: a API apura um assunto por
 * chamada (`topico`), enquanto a interface mostra os três assuntos como uma
 * etapa só (`topicos`). Fundir as duas obrigaria a tela a conhecer a mecânica
 * de paginação da apuração, que não é assunto dela.
 *
 * Este módulo é o único do boletim que o cliente importa. Prompt, chave de API
 * e peneira de conformidade ficam no servidor — ver `src/app/api/boletim/`.
 */

/** Um pedido que a rota sabe atender. */
export const BLOCOS_API = [
  "painel",
  "pauta",
  "topico",
  "publica",
  "internacional",
  "regional",
  "fio",
] as const;

export type BlocoApi = (typeof BLOCOS_API)[number];

export function ehBlocoApi(valor: unknown): valor is BlocoApi {
  return typeof valor === "string" && (BLOCOS_API as readonly string[]).includes(valor);
}

/** Blocos que precisam consultar a web. `fio` trabalha só sobre o já apurado. */
export function usaBusca(bloco: BlocoApi): boolean {
  return bloco !== "fio";
}

/** Uma linha do trilho de apuração, na ordem em que roda. */
export type Etapa = {
  readonly id: string;
  readonly rotulo: string;
};

export const ETAPAS: readonly Etapa[] = [
  { id: "painel", rotulo: "Painel de abertura" },
  { id: "pauta", rotulo: "Pauta do dia" },
  { id: "topicos", rotulo: "Movimentos em profundidade" },
  { id: "publica", rotulo: "Decisão pública" },
  { id: "internacional", rotulo: "Frente internacional" },
  { id: "regional", rotulo: "Nordeste e Alagoas" },
  { id: "fio", rotulo: "Fio condutor e apêndice" },
];
