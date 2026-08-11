/**
 * As utilidades de JSON.
 *
 * Elas existem porque a resposta de um modelo de linguagem não é uma API: vem
 * com cerca de markdown quando o modelo resolve ser prestativo, e vem cortada
 * no meio quando bate o teto de tokens. Os dois casos são recuperáveis, e
 * recuperar custa menos que uma chamada nova.
 *
 * O teste que mais importa aqui é o último de cada bloco — o que confere que
 * lixo continua sendo rejeitado. Um reparador tolerante demais transforma
 * resposta errada em objeto silenciosamente vazio, e aí o defeito aparece só
 * na tela do usuário.
 */

import { describe, expect, it } from "vitest";

import { extrairJson } from "../src/domain/json/extrair";
import { repararJson } from "../src/domain/json/reparar";

describe("reparo de JSON truncado", () => {
  it("devolve o JSON intacto quando ele já está completo", () => {
    expect(repararJson('{"a":1,"b":[2,3]}')).toEqual({ a: 1, b: [2, 3] });
  });

  it("fecha um objeto cortado depois de um valor", () => {
    expect(repararJson('{"nome":"Selic","valor":"15%"')).toEqual({
      nome: "Selic",
      valor: "15%",
    });
  });

  it("fecha objeto e lista aninhados, na ordem certa", () => {
    const cortado = '{"itens":[{"titulo":"IPCA","fontes":[{"veiculo":"IBGE"';
    expect(repararJson(cortado)).toEqual({
      itens: [{ titulo: "IPCA", fontes: [{ veiculo: "IBGE" }] }],
    });
  });

  it("descarta a vírgula pendurada do item que não chegou a vir", () => {
    expect(repararJson('{"indicadores":[{"nome":"Selic"},')).toEqual({
      indicadores: [{ nome: "Selic" }],
    });
  });

  it("recua até antes de uma string aberta em vez de fechá-la com aspas", () => {
    // Fechar a string produziria um valor pela metade — "Banco Cen" viraria
    // fonte legítima no boletim. Melhor perder o campo do que inventá-lo.
    const cortado = '{"a":"completo","b":"Banco Cen';
    expect(repararJson(cortado)).toEqual({ a: "completo" });
  });

  it("preserva escape dentro de string ao contar as chaves", () => {
    expect(repararJson('{"citacao":"disse \\"não\\" }","fim":1}')).toEqual({
      citacao: 'disse "não" }',
      fim: 1,
    });
  });

  it("recupera uma lista truncada no topo", () => {
    expect(repararJson('[{"a":1},{"b":2')).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("rejeita o que não é JSON em nenhum prefixo", () => {
    expect(() => repararJson("desculpe, não consegui apurar")).toThrow();
  });

  it("rejeita JSON malformado que não é truncamento", () => {
    // Aspas simples é resposta errada, não resposta interrompida: aceitá-la
    // esconderia um defeito de prompt.
    expect(() => repararJson("{'a': 1}")).toThrow();
  });
});

describe("extração do JSON da resposta", () => {
  it("aceita JSON puro", () => {
    expect(extrairJson('{"ok":true}')).toEqual({ ok: true });
  });

  it("tira a cerca de markdown", () => {
    expect(extrairJson('```json\n{"ok":true}\n```')).toEqual({ ok: true });
    expect(extrairJson('```JSON\n{"ok":true}\n```')).toEqual({ ok: true });
    expect(extrairJson('```\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("ignora a prosa antes do corpo", () => {
    expect(extrairJson('Aqui está o resultado:\n{"ok":true}')).toEqual({ ok: true });
  });

  it("acha uma lista no topo", () => {
    expect(extrairJson("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("cai no reparo quando o corpo vem truncado", () => {
    expect(extrairJson('```json\n{"indicadores":[{"nome":"Selic"')).toEqual({
      indicadores: [{ nome: "Selic" }],
    });
  });

  it("ignora colchete de nota de rodapé na prosa e acha o objeto", () => {
    // "[1]" numa referência não é o começo de uma lista. Pegar o primeiro
    // colchete que aparece devolveria [1] e perderia a apuração inteira.
    expect(extrairJson('Segundo o IBGE [1], veja:\n{"ok":true}')).toEqual({ ok: true });
  });

  it("prefere a leitura que recupera mais dado quando o corpo vem truncado", () => {
    // Truncado e com colchete antes: nenhum candidato abre JSON íntegro, então
    // o desempate é pelo tamanho do que dá para recuperar.
    expect(extrairJson('Fonte [1], resultado:\n{"indicadores":[{"nome":"Selic"')).toEqual({
      indicadores: [{ nome: "Selic" }],
    });
  });

  it("não confunde uma lista interna com o corpo da resposta", () => {
    expect(extrairJson('{"valores":[1,2')).toEqual({ valores: [1, 2] });
  });

  it("rejeita resposta sem JSON algum", () => {
    expect(() => extrairJson("não localizei nada nas últimas 48 horas")).toThrow(
      /sem JSON/i,
    );
  });

  it("rejeita texto vazio", () => {
    expect(() => extrairJson("")).toThrow();
  });
});
