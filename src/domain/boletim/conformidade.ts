/**
 * A peneira de conformidade sobre texto gerado.
 *
 * O resto do site publica texto curado: alguém escreveu, alguém revisou, e
 * `tests/compliance.test.ts` varre o resultado antes do commit. O boletim
 * rompe esse arranjo — o texto nasce em produção, depois do último teste, e
 * ninguém o lê antes do leitor.
 *
 * A resposta não é confiar no prompt. O prompt já proíbe recomendar, e é a
 * primeira linha de defesa; esta é a segunda, e é a que não depende de o modelo
 * ter obedecido. Todo texto gerado passa por `findViolations`, a mesma função
 * que o guardrail do catálogo usa, com a mesma lista de padrões. A política é
 * uma só.
 *
 * **A unidade de descarte é a unidade de exibição.** Um item com violação sai
 * inteiro da tela; não se apaga um campo e mantém o cartão. Meia notícia com um
 * buraco no meio faz o leitor preencher a lacuna sozinho, que é exatamente o
 * risco que a varredura existe para evitar. O que sai vira contagem visível na
 * interface, e não descarte silencioso: se a peneira estiver pegando demais, o
 * operador precisa enxergar isso.
 *
 * Falso positivo custa um item a menos no boletim de hoje. Falso negativo custa
 * exposição regulatória. A assimetria decide o desenho.
 */

import { findViolations, type ComplianceViolation } from "../compliance/policy";

export type Peneirado<T> = {
  readonly conteudo: T;
  /** Detalhe para o log do servidor: um item pode casar com vários padrões. */
  readonly descartes: readonly ComplianceViolation[];
  /**
   * Quantos itens saíram da tela — e não quantos padrões casaram.
   *
   * A distinção não é cosmética. "Recomendamos a melhor opção" casa com dois
   * padrões num item só, e reportar 2 infla justamente o número que
   * `docs/RISKS.md` manda o operador vigiar para saber se a peneira está
   * pegando demais. O log recebe as violações; a tela recebe a contagem.
   */
  readonly itensDescartados: number;
};

/**
 * Todo texto legível de um valor, achatado numa string só.
 *
 * URLs ficam de fora, e por um motivo concreto: manchete vira slug, e um link
 * legítimo do Valor ou da InfoMoney pode carregar "recomendacao" ou
 * "oportunidade" no caminho. Varrer a URL descartaria a notícia por causa do
 * endereço dela, não do que ela diz.
 *
 * Os campos são unidos por ponto, e isso não é formatação: vários padrões da
 * política estão ancorados em início de oração, porque em português "compra" e
 * "venda" também são substantivos e só o imperativo importa. Juntando campo com
 * espaço, o começo de um campo deixa de ser começo de frase, e um valor como
 * "compre dólar" some no meio da linha. O limite de campo é limite de oração.
 */
function textoLegivel(valor: unknown): string {
  if (typeof valor === "string") return valor;
  if (typeof valor === "number") return String(valor);
  if (Array.isArray(valor)) return valor.map(textoLegivel).join(". ");

  if (typeof valor === "object" && valor !== null) {
    return Object.entries(valor as Record<string, unknown>)
      .filter(([chave]) => chave !== "url")
      .map(([, item]) => textoLegivel(item))
      .join(". ");
  }

  return "";
}

/** Descarta os itens da lista que carregam vocabulário proibido. */
export function peneirarItens<T>(
  itens: readonly T[],
  origem: string,
): Peneirado<readonly T[]> {
  const mantidos: T[] = [];
  const descartes: ComplianceViolation[] = [];
  let itensDescartados = 0;

  itens.forEach((item, indice) => {
    const violacoes = findViolations(textoLegivel(item), `${origem}[${indice}]`);
    if (violacoes.length === 0) {
      mantidos.push(item);
      return;
    }
    descartes.push(...violacoes);
    itensDescartados += 1;
  });

  return { conteudo: mantidos, descartes, itensDescartados };
}

/** Zera um texto solto que carregue vocabulário proibido. */
export function peneirarTexto(valor: string, origem: string): Peneirado<string> {
  const descartes = findViolations(valor, origem);
  const removido = descartes.length > 0;
  return {
    conteudo: removido ? "" : valor,
    descartes,
    itensDescartados: removido ? 1 : 0,
  };
}
