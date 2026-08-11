/**
 * A porta de entrada do texto gerado no domínio.
 *
 * Duas passagens, nesta ordem, e nenhuma delas é opcional:
 *
 * 1. **Normalizar** — a resposta é `unknown` até prova em contrário. Campo
 *    ausente, tipo trocado, lista longa demais, URL de esquema estranho: tudo
 *    vira forma conhecida ou é descartado (`normalizar.ts`).
 * 2. **Peneirar** — o que sobrou passa pela lista de vocabulário proibido da
 *    política, item a item (`conformidade.ts`).
 *
 * A rota HTTP não faz nada disso por conta própria: ela chama `conferirBloco` e
 * devolve o resultado. Assim a regra fica testável sem subir servidor, que é a
 * mesma razão de `src/domain/` não importar React.
 */

import type { ComplianceViolation } from "../compliance/policy";

import type { BlocoApi } from "./blocos";
import { peneirarItens, peneirarTexto, type Peneirado } from "./conformidade";
import {
  normalizarFio,
  normalizarInternacional,
  normalizarPainel,
  normalizarPauta,
  normalizarPublica,
  normalizarRegional,
  normalizarTopico,
} from "./normalizar";

type Resultado = {
  /** Já normalizado e peneirado. Pronto para serializar. */
  readonly conteudo: unknown;
  /** Detalhe para o log do servidor. */
  readonly descartes: readonly ComplianceViolation[];
  /** Quantos itens saíram da tela. É este número que a interface mostra. */
  readonly itensDescartados: number;
};

/** Soma as peneiras de um bloco preservando as duas contagens separadas. */
function somar(...peneiras: readonly Peneirado<unknown>[]): Omit<Resultado, "conteudo"> {
  return {
    descartes: peneiras.flatMap((peneira) => peneira.descartes),
    itensDescartados: peneiras.reduce((total, peneira) => total + peneira.itensDescartados, 0),
  };
}

export function conferirBloco(bloco: BlocoApi, bruto: unknown): Resultado {
  switch (bloco) {
    case "painel": {
      const { indicadores } = normalizarPainel(bruto);
      const peneira = peneirarItens(indicadores, "painel.indicadores");
      return { conteudo: { indicadores: peneira.conteudo }, ...somar(peneira) };
    }

    case "pauta": {
      const { topicos } = normalizarPauta(bruto);
      const peneira = peneirarItens(topicos, "pauta.topicos");
      return { conteudo: { topicos: peneira.conteudo }, ...somar(peneira) };
    }

    case "topico": {
      // Um tópico é um cartão só: ou passa inteiro, ou não vai para a tela.
      const topico = normalizarTopico(bruto);
      const peneira = peneirarItens([topico], "topico");
      const [mantido] = peneira.conteudo;
      return { conteudo: mantido ?? null, ...somar(peneira) };
    }

    case "publica": {
      const { itens } = normalizarPublica(bruto);
      const peneira = peneirarItens(itens, "publica.itens");
      return { conteudo: { itens: peneira.conteudo }, ...somar(peneira) };
    }

    case "internacional": {
      const { itens } = normalizarInternacional(bruto);
      const peneira = peneirarItens(itens, "internacional.itens");
      return { conteudo: { itens: peneira.conteudo }, ...somar(peneira) };
    }

    case "regional": {
      const { itens, nota } = normalizarRegional(bruto);
      const peneiraItens = peneirarItens(itens, "regional.itens");
      const peneiraNota = peneirarTexto(nota, "regional.nota");
      return {
        conteudo: { itens: peneiraItens.conteudo, nota: peneiraNota.conteudo },
        ...somar(peneiraItens, peneiraNota),
      };
    }

    case "fio": {
      const { fio, apendice } = normalizarFio(bruto);
      const peneiraFio = peneirarTexto(fio, "fio.fio");
      const fatos = peneirarItens(apendice.fatos, "fio.apendice.fatos");
      const inferencias = peneirarItens(apendice.inferencias, "fio.apendice.inferencias");
      const hipoteses = peneirarItens(apendice.hipoteses, "fio.apendice.hipoteses");
      const lacunas = peneirarItens(apendice.lacunas, "fio.apendice.lacunas");

      return {
        conteudo: {
          fio: peneiraFio.conteudo,
          apendice: {
            fatos: fatos.conteudo,
            inferencias: inferencias.conteudo,
            hipoteses: hipoteses.conteudo,
            lacunas: lacunas.conteudo,
          },
        },
        ...somar(peneiraFio, fatos, inferencias, hipoteses, lacunas),
      };
    }
  }
}
