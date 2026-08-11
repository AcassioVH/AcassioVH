/**
 * Extração do JSON de dentro de uma resposta em prosa.
 *
 * O prompt pede JSON puro, e o modelo quase sempre obedece. "Quase" é o
 * problema: de vez em quando vem uma cerca de markdown em volta, ou uma frase
 * antes ("Aqui está o resultado:"), e uma resposta boa se perde por causa da
 * embalagem.
 *
 * Duas tolerâncias, e só duas: cerca de código e texto antes do primeiro `{`.
 * Nada além disso é aceito — ver o comentário em `reparar.ts` sobre por que
 * tolerar demais esconde defeito de prompt.
 */

import { repararJson } from "./reparar";

/** Tira ```json, ```JSON, ```` ``` ```` e qualquer outra cerca de linguagem. */
function semCercas(texto: string): string {
  return texto.replace(/```[a-z]*/gi, "").trim();
}

/**
 * Onde o corpo pode começar: no primeiro `{` e no primeiro `[`, nessa ordem.
 *
 * Pegar simplesmente o que vier antes é o que quebra. A prosa que o modelo
 * escreve antes do JSON costuma trazer um colchete — "segundo o IBGE [1]" é
 * uma referência, não o início de uma lista — e começar ali joga fora a
 * resposta inteira. Por isso são candidatos, testados em ordem, e não um
 * palpite só.
 */
function candidatos(texto: string): readonly number[] {
  const posicoes = [texto.indexOf("{"), texto.indexOf("[")].filter((i) => i !== -1);
  return [...new Set(posicoes)].sort((a, b) => a - b);
}

/**
 * Devolve o JSON contido em `texto`, reparando-o se vier truncado.
 *
 * A ordem das tentativas importa. Primeiro procura um candidato que abra um
 * JSON **íntegro** — é o caso normal, e é a única leitura que não envolve
 * palpite.
 *
 * Se nenhum abrir, a resposta veio truncada e aí não existe candidato
 * obviamente certo: em `{"a":[1,2` o começo é a leitura boa, e em
 * `segundo o IBGE [1], veja: {"a":1` é a segunda. O critério de desempate é
 * **recuperar mais dado** — repara a partir de cada candidato e fica com o
 * resultado maior. No primeiro caso isso escolhe o objeto inteiro em vez da
 * lista interna; no segundo, o objeto em vez do `[1]` que era uma nota de
 * rodapé.
 *
 * @throws se não houver JSON algum, ou se o que houver for irrecuperável.
 */
export function extrairJson(texto: string): unknown {
  const limpo = semCercas(texto ?? "");
  const inicios = candidatos(limpo);
  if (inicios.length === 0) throw new Error("resposta sem JSON");

  for (const inicio of inicios) {
    try {
      return JSON.parse(limpo.slice(inicio)) as unknown;
    } catch {
      // Este candidato não abre um JSON íntegro. Tenta o próximo.
    }
  }

  let melhor: { valor: unknown; tamanho: number } | null = null;
  for (const inicio of inicios) {
    try {
      const valor = repararJson(limpo.slice(inicio));
      const tamanho = JSON.stringify(valor)?.length ?? 0;
      if (!melhor || tamanho > melhor.tamanho) melhor = { valor, tamanho };
    } catch {
      // Este candidato não é recuperável. Tenta o próximo.
    }
  }

  if (!melhor) throw new Error("JSON irrecuperável");
  return melhor.valor;
}
