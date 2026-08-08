/**
 * Mantém a varredura de HTML honesta.
 *
 * `scripts/varrer-html.mjs` roda fora do TypeScript, depois do build, e por isso
 * repete os padrões proibidos em JavaScript puro em vez de importar o domínio.
 * Duplicação é dívida: alguém acrescenta um padrão na política e a varredura do
 * HTML continua cega para ele — pior do que não ter varredura, porque passa a
 * sensação de estar coberto.
 *
 * Este teste é o que torna a duplicação segura. Ele compara as duas listas e
 * falha quando uma anda sem a outra.
 */

import { describe, expect, it } from "vitest";

import { DECLARACOES_DA_POLITICA, PROIBIDO } from "../scripts/varrer-html.mjs";
import {
  DISCLAIMER_FULL,
  DISCLAIMER_SHORT,
  FORBIDDEN_PATTERNS,
  SCOPE_STATEMENT,
} from "../src/domain/compliance/policy";

describe("sincronia entre a política e a varredura de HTML", () => {
  it("cobre exatamente os mesmos padrões proibidos", () => {
    const naPolitica = FORBIDDEN_PATTERNS.map((p) => p.pattern.source);
    const naVarredura = PROIBIDO.map(([p]) => p.source);

    const faltando = naPolitica.filter((p) => !naVarredura.includes(p));
    const sobrando = naVarredura.filter((p) => !naPolitica.includes(p));

    expect(
      faltando,
      `padrões na política que a varredura de HTML não checa:\n  ${faltando.join("\n  ")}`,
    ).toEqual([]);
    expect(
      sobrando,
      `padrões na varredura que saíram da política:\n  ${sobrando.join("\n  ")}`,
    ).toEqual([]);
  });

  it("mantém os mesmos motivos, para o relatório de erro dizer a mesma coisa", () => {
    const naPolitica = new Set(FORBIDDEN_PATTERNS.map((p) => p.reason));
    for (const [, motivo] of PROIBIDO) {
      expect(naPolitica, `motivo "${motivo}" não existe na política`).toContain(motivo);
    }
  });
});

describe("as frases que a varredura ignora", () => {
  /**
   * Cada trecho excluído precisa existir em algum texto oficial do site. Sem
   * esta checagem, alguém poderia silenciar uma violação real acrescentando a
   * frase infratora à lista de exceções — e a varredura viraria enfeite.
   */
  it("só ignora frase que o próprio site publica", () => {
    const oficiais = [DISCLAIMER_SHORT, DISCLAIMER_FULL, SCOPE_STATEMENT]
      .join(" ")
      .toLowerCase();

    // Estas nascem em componente, não na política: são os rótulos das listas de
    // limite e a linha do rodapé. Ficam declaradas aqui para não passarem batido.
    const naInterface = [
      "não recomenda produtos, não classifica por qualidade",
      "sem recomendação, sem ranking, sem promessa de retorno",
      "recomendação de compra",
      "não indica o que comprar, manter ou vender",
      "alerta de urgência ou oportunidade",
      "não recomenda, não classifica por mérito",
      "não presta consultoria, análise ou recomendação de valores mobiliários",
    ];

    for (const declaracao of DECLARACOES_DA_POLITICA) {
      const d = declaracao.toLowerCase();
      const conhecida = oficiais.includes(d) || naInterface.includes(d);
      expect(
        conhecida,
        `"${declaracao}" está na lista de exceções mas não aparece em nenhum ` +
          `texto oficial do site — exceção sem origem silencia violação real`,
      ).toBe(true);
    }
  });
});
