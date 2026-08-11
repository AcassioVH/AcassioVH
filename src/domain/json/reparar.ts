/**
 * Conserto de JSON cortado no meio.
 *
 * Um modelo de linguagem que atinge o teto de tokens não devolve um erro: ele
 * devolve JSON válido até o ponto em que parou, e inválido a partir dali. Jogar
 * a resposta fora custa uma chamada inteira; recuperar o que já veio custa
 * alguns milissegundos.
 *
 * A estratégia é recuar: vai encurtando o texto até achar um ponto onde o que
 * sobrou é fechável — nenhuma string aberta, e a pilha de `{` e `[` pode ser
 * fechada em ordem. O que se perde é sempre a cauda, nunca o miolo.
 *
 * Não é um parser tolerante de propósito geral. Ele não conserta vírgula
 * faltando, aspas simples nem chave sem aspas: essas são respostas *erradas*, e
 * aceitá-las esconderia um defeito de prompt. Ele conserta uma resposta
 * *interrompida*, que é falha de orçamento de tokens, não de formato.
 */

/** Só vale a pena tentar fechar num ponto que já parece fim de alguma coisa. */
function pareceFim(caractere: string): boolean {
  return caractere === "}" || caractere === "]" || caractere === '"';
}

type Varredura = {
  /** Pilha de aberturas ainda não fechadas, na ordem em que apareceram. */
  readonly pilha: readonly ("{" | "[")[];
  /** Se o fragmento termina no meio de uma string, não há como fechá-lo. */
  readonly dentroDeString: boolean;
};

/**
 * Percorre o fragmento contando aberturas e fechamentos.
 *
 * O estado de string é obrigatório: um `}` dentro de `"não é fecho }"` não
 * fecha nada, e a barra invertida precisa ser respeitada para que `\"` não seja
 * lido como fim de string.
 */
function varrer(fragmento: string): Varredura {
  const pilha: ("{" | "[")[] = [];
  let dentroDeString = false;
  let escapado = false;

  for (const caractere of fragmento) {
    if (dentroDeString) {
      if (escapado) escapado = false;
      else if (caractere === "\\") escapado = true;
      else if (caractere === '"') dentroDeString = false;
      continue;
    }

    if (caractere === '"') dentroDeString = true;
    else if (caractere === "{" || caractere === "[") pilha.push(caractere);
    else if (caractere === "}" || caractere === "]") pilha.pop();
  }

  return { pilha, dentroDeString };
}

/** Fecha a pilha na ordem inversa: o último aberto é o primeiro a fechar. */
function fechamento(pilha: readonly ("{" | "[")[]): string {
  let saida = "";
  for (let i = pilha.length - 1; i >= 0; i--) saida += pilha[i] === "{" ? "}" : "]";
  return saida;
}

/**
 * Devolve o maior prefixo do texto que forma um JSON válido depois de fechado.
 *
 * @throws se nenhum prefixo for recuperável.
 */
export function repararJson(bruto: string): unknown {
  const texto = bruto.trimEnd();

  for (let fim = texto.length; fim > 1; fim--) {
    const ultimo = texto[fim - 1];
    if (ultimo === undefined) continue;
    // O texto inteiro sempre merece uma tentativa; a partir daí, só cortes que
    // caem num limite plausível — o resto seria JSON.parse em cima de lixo.
    if (fim !== texto.length && !pareceFim(ultimo)) continue;

    const fragmento = texto.slice(0, fim);
    const { pilha, dentroDeString } = varrer(fragmento);
    if (dentroDeString) continue;

    // Uma vírgula pendurada é o rastro do item que não chegou a vir.
    const limpo = fragmento.replace(/,\s*$/, "");

    try {
      return JSON.parse(limpo + fechamento(pilha)) as unknown;
    } catch {
      // Recua mais um caractere.
    }
  }

  throw new Error("JSON irrecuperável");
}
