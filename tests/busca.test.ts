/**
 * A busca é domínio, e por isso é testada aqui e não no navegador.
 *
 * O modo de falhar de uma busca é silencioso: o produto continua no site,
 * continua na navegação, e some do campo. Ninguém percebe até um cliente
 * digitar a sigla e não achar nada.
 */

import { describe, expect, it } from "vitest";

import { CATALOGUED_CLASSES, CATEGORIES } from "../src/domain/assets/destinations";
import { normalize, search, SEARCH_INDEX } from "../src/domain/assets/search";
import { profileFor } from "../src/domain/assets/profiles";
import { INSTITUTION_KINDS } from "../src/domain/institutions/kinds";

describe("índice de busca", () => {
  it("indexa toda categoria, todo produto e todo tipo de instituição", () => {
    expect(SEARCH_INDEX.length).toBe(
      CATEGORIES.length + CATALOGUED_CLASSES.length + INSTITUTION_KINDS.length,
    );
  });

  /**
   * "Corretora", "cooperativa", "securitizadora" são perguntas que chegam pela
   * busca antes de chegarem pelo menu — e a página de instituições nasceu
   * justamente porque não havia resposta para elas.
   */
  it("acha todo tipo de instituição pelo nome curto", () => {
    for (const kind of INSTITUTION_KINDS) {
      const achados = search(kind.short).map((r) => r.id);
      expect(achados, `"${kind.short}" não acha ${kind.id}`).toContain(kind.id);
    }
  });

  /**
   * A sigla é como a maioria procura — "CDB", "LCI", "CRA". Se uma delas não
   * encontrar o próprio verbete, a busca falhou no caso mais comum que existe.
   */
  it("acha todo produto pela própria sigla", () => {
    for (const assetClass of CATALOGUED_CLASSES) {
      const profile = profileFor(assetClass);
      const achados = search(profile.label).map((r) => r.id);
      expect(achados, `"${profile.label}" não acha ${assetClass}`).toContain(assetClass);
    }
  });

  it("acha todo produto pelo nome por extenso", () => {
    for (const assetClass of CATALOGUED_CLASSES) {
      const profile = profileFor(assetClass);
      const achados = search(profile.fullName).map((r) => r.id);
      expect(achados, `"${profile.fullName}" não acha ${assetClass}`).toContain(assetClass);
    }
  });

  it("acha toda categoria pelo nome", () => {
    for (const category of CATEGORIES) {
      const achados = search(category.label).map((r) => r.id);
      expect(achados, `"${category.label}" não acha a categoria`).toContain(category.id);
    }
  });
});

describe("comportamento da busca", () => {
  it("ignora acento e caixa", () => {
    expect(normalize("Câmbio")).toBe("cambio");
    expect(search("cambio").map((r) => r.id)).toContain("FUNDO_CAMBIAL");
    expect(search("PREVIDENCIA").map((r) => r.id)).toContain("previdencia");
  });

  it("casa por prefixo de palavra, e não por pedaço solto no meio", () => {
    // "gro" está dentro de "agronegócio", mas ninguém digita assim esperando achá-lo.
    expect(search("gro")).toEqual([]);
    expect(search("agro").length).toBeGreaterThan(0);
  });

  it("estreita conforme a pessoa escreve", () => {
    const um = search("fundo").length;
    const dois = search("fundo cambial").length;
    expect(dois).toBeLessThan(um);
    expect(search("fundo cambial")[0]?.id).toBe("FUNDO_CAMBIAL");
  });

  it("prefere a sigla exata ao produto que só menciona o termo", () => {
    expect(search("cra")[0]?.id).toBe("CRA");
    expect(search("etf")[0]?.id).toBe("ETF");
  });

  /**
   * Quem digita "renda fixa" quer a porta, não um dos catorze verbetes que
   * moram atrás dela. A categoria ganha o topo por ser o degrau mais geral —
   * critério de navegação, não de mérito do produto.
   */
  it("põe a categoria acima dos produtos dela em empate", () => {
    expect(search("renda fixa")[0]?.kind).toBe("categoria");
    expect(search("internacional")[0]?.kind).toBe("categoria");
  });

  it("não devolve nada para busca vazia ou só espaço", () => {
    expect(search("")).toEqual([]);
    expect(search("   ")).toEqual([]);
  });

  it("respeita o limite de resultados", () => {
    expect(search("a", 5).length).toBeLessThanOrEqual(5);
  });

  /**
   * A busca é caminho de navegação, nunca vitrine: não existe "mais
   * procurados", não há destaque patrocinado, e a ordem depende só do que foi
   * digitado. Duas consultas iguais devolvem a mesma coisa, sempre.
   */
  it("é determinística — a mesma consulta devolve a mesma ordem", () => {
    const a = search("fundo").map((r) => r.id);
    const b = search("fundo").map((r) => r.id);
    expect(a).toEqual(b);
  });

  it("aponta para rotas que existem", () => {
    for (const entry of SEARCH_INDEX) {
      if (entry.kind === "categoria") {
        expect(CATEGORIES.some((c) => c.id === entry.id)).toBe(true);
        expect(entry.href).toBe(`/categorias/${entry.id}`);
      } else if (entry.kind === "instituicao") {
        expect(INSTITUTION_KINDS.some((k) => k.id === entry.id)).toBe(true);
        // Âncora, e não rota própria: o alvo é o `id` do artigo na página.
        expect(entry.href).toBe(`/instituicoes#${entry.id}`);
      } else {
        expect(CATALOGUED_CLASSES).toContain(entry.id);
        expect(entry.href).toBe(`/produtos/${entry.id}`);
      }
    }
  });
});
