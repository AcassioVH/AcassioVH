/**
 * O boletim de conjuntura, e por que ele precisa de um guardrail próprio.
 *
 * Todo o resto do conteúdo do site é curado: alguém escreveu, alguém revisou, e
 * `tests/compliance.test.ts` varre o catálogo antes do commit. O boletim rompe
 * isso — o texto nasce em produção, gerado por um modelo, depois do último
 * teste ter rodado.
 *
 * Este arquivo cobre as duas coisas que impedem esse texto de virar um
 * problema, e a ordem importa:
 *
 * 1. **A normalização** trata a resposta como o que ela é: dado de terceiro,
 *    sem contrato. Tipo trocado, campo ausente, lista longa demais, URL
 *    `javascript:` — nada disso pode chegar ao React.
 * 2. **A peneira de conformidade** aplica a mesma lista de vocabulário
 *    proibido do catálogo ao texto gerado.
 *
 * O teste mais importante é o do caminho inverso: **conteúdo que DEVE ser
 * descartado**. Sem ele, uma peneira quebrada passaria como "nenhuma violação
 * encontrada", que é o pior modo de falha possível para um guardrail — é a
 * mesma razão pela qual `compliance.test.ts` também testa os exemplos que
 * precisam ser pegos.
 */

import { describe, expect, it } from "vitest";

import { BLOCOS_API, ehBlocoApi, usaBusca } from "../src/domain/boletim/blocos";
import { conferirBloco } from "../src/domain/boletim/conferir";
import { peneirarItens, peneirarTexto } from "../src/domain/boletim/conformidade";
import { criarLimitador } from "../src/domain/boletim/limite";
import {
  normalizarFio,
  normalizarPainel,
  normalizarPauta,
  normalizarRegional,
  normalizarTopico,
} from "../src/domain/boletim/normalizar";
import type { Indicador, Painel, Regional, Topico } from "../src/domain/boletim/tipos";

describe("normalização da resposta do modelo", () => {
  it("aceita um painel bem formado", () => {
    const painel = normalizarPainel({
      indicadores: [
        {
          nome: "Selic meta",
          valor: "15,00%",
          variacao: "estável",
          direcao: "estavel",
          fonte: "Banco Central",
          data: "2026-08-11",
        },
      ],
    });

    expect(painel.indicadores).toHaveLength(1);
    expect(painel.indicadores[0]?.nome).toBe("Selic meta");
    expect(painel.indicadores[0]?.direcao).toBe("estavel");
  });

  it("descarta indicador sem nome ou sem valor", () => {
    const painel = normalizarPainel({
      indicadores: [
        { nome: "", valor: "15%" },
        { nome: "Ibovespa", valor: "" },
        { nome: "USD/BRL", valor: "5,40" },
      ],
    });

    expect(painel.indicadores.map((i) => i.nome)).toEqual(["USD/BRL"]);
  });

  it("corta a lista no limite que o prompt pediu, mesmo se o modelo ignorar", () => {
    const excesso = Array.from({ length: 12 }, (_, i) => ({ nome: `Ind ${i}`, valor: "1" }));
    expect(normalizarPainel({ indicadores: excesso }).indicadores).toHaveLength(5);
    expect(normalizarPauta({ topicos: excesso.map((_, i) => ({ titulo: `T${i}` })) }).topicos)
      .toHaveLength(3);
  });

  it("cai para 'estavel' quando a direção vem fora do vocabulário", () => {
    const painel = normalizarPainel({
      indicadores: [{ nome: "X", valor: "1", direcao: "explodindo" }],
    });
    expect(painel.indicadores[0]?.direcao).toBe("estavel");
  });

  it("sobrevive a resposta de forma completamente errada", () => {
    for (const entrada of [null, undefined, "texto", 42, [], { indicadores: "nenhum" }]) {
      expect(normalizarPainel(entrada).indicadores).toEqual([]);
    }
  });

  it("converte número em texto em vez de descartar o campo", () => {
    const painel = normalizarPainel({ indicadores: [{ nome: "Selic", valor: 15 }] });
    expect(painel.indicadores[0]?.valor).toBe("15");
  });

  it("guarda apenas confiança do vocabulário conhecido", () => {
    expect(normalizarTopico({ titulo: "t", confianca: "alta" }).confianca).toBe("alta");
    expect(normalizarTopico({ titulo: "t", confianca: "altíssima" }).confianca).toBeNull();
    expect(normalizarTopico({ titulo: "t" }).confianca).toBeNull();
  });

  it("aceita fonte com URL http(s) e mantém o veículo quando não há link", () => {
    const topico = normalizarTopico({
      titulo: "t",
      fontes: [
        { veiculo: "Valor", data: "11/08", url: "https://valor.globo.com/noticia" },
        { veiculo: "Reuters", data: "11/08" },
      ],
    });

    expect(topico.fontes).toHaveLength(2);
    expect(topico.fontes[0]?.url).toBe("https://valor.globo.com/noticia");
    expect(topico.fontes[1]?.url).toBeUndefined();
  });

  it("recusa URL de esquema perigoso sem perder a atribuição", () => {
    // `javascript:` num href é XSS, e o React não protege contra isso em <a>.
    // A fonte continua na tela como texto: perder a atribuição seria pior.
    const topico = normalizarTopico({
      titulo: "t",
      fontes: [
        { veiculo: "Falso", data: "11/08", url: "javascript:alert(1)" },
        { veiculo: "Outro", data: "11/08", url: "data:text/html,<script>" },
        { veiculo: "Terceiro", data: "11/08", url: "não é url" },
      ],
    });

    expect(topico.fontes).toHaveLength(3);
    for (const fonte of topico.fontes) expect(fonte.url).toBeUndefined();
  });

  it("descarta fonte sem veículo: sem quem publicou, não é fonte", () => {
    const topico = normalizarTopico({
      titulo: "t",
      fontes: [{ veiculo: "", url: "https://exemplo.com" }, { veiculo: "IBGE" }],
    });
    expect(topico.fontes.map((f) => f.veiculo)).toEqual(["IBGE"]);
  });

  it("normaliza o apêndice preservando a separação entre fato e inferência", () => {
    const fio = normalizarFio({
      fio: "Um parágrafo.",
      apendice: {
        fatos: ["IPCA de julho saiu em 0,26% (IBGE, 08/08).", "", 12],
        inferencias: [
          { texto: "O câmbio deve seguir sensível ao fiscal.", confianca: "media" },
          { texto: "", confianca: "alta" },
        ],
        hipoteses: ["Cenário não confirmado."],
        lacunas: [],
      },
    });

    expect(fio.apendice.fatos).toHaveLength(2);
    expect(fio.apendice.inferencias).toHaveLength(1);
    expect(fio.apendice.inferencias[0]?.confianca).toBe("media");
    expect(fio.apendice.lacunas).toEqual([]);
  });

  it("mantém a nota do bloco regional quando não há itens", () => {
    const regional: Regional = normalizarRegional({
      itens: [],
      nota: "Nenhum movimento localizado nas últimas 48 horas.",
    });
    expect(regional.itens).toEqual([]);
    expect(regional.nota).toContain("Nenhum movimento");
  });
});

describe("peneira de conformidade sobre texto gerado", () => {
  /**
   * O caminho inverso, e é o teste que sustenta todos os outros deste bloco.
   *
   * Cada linha aqui é uma frase que um modelo pode plausivelmente escrever num
   * boletim de conjuntura e que não pode chegar à tela deste site. Se a peneira
   * parar de funcionar, é aqui que o CI fica vermelho — não num relatório
   * tranquilizador dizendo que nada foi encontrado.
   */
  const DEVE_SER_DESCARTADO = [
    "Recomendamos atenção ao setor elétrico neste momento.",
    "O movimento abre uma boa oportunidade em renda fixa.",
    "Vale a pena acompanhar os títulos longos.",
    "A melhor opção para quem busca proteção é o cambial.",
    "O papel deve render 14% ao ano com o novo cenário.",
    "O retorno esperado do setor melhora com o corte de juros.",
    "O dólar vai subir se o fiscal não for endereçado.",
    "Não invista em prefixados antes da decisão do Copom.",
    "Aconselhamos cautela com ativos de duration longa.",
    "O ativo é mais seguro que a poupança no cenário atual.",
  ];

  it("descarta o item que carrega vocabulário de recomendação", () => {
    for (const frase of DEVE_SER_DESCARTADO) {
      const { conteudo, descartes } = peneirarItens([{ fato: frase }], "teste");
      expect(descartes.length, `deveria descartar: ${frase}`).toBeGreaterThan(0);
      expect(conteudo).toEqual([]);
    }
  });

  it("mantém o item que apenas descreve, com fonte", () => {
    const legitimos = [
      { fato: "O Copom manteve a Selic em 15,00% na reunião de 30/07 (Banco Central)." },
      { fato: "O IPCA de julho ficou em 0,26%, informou o IBGE em 08/08." },
      { fato: "O dólar fechou a R$ 5,42, alta de 0,4% no dia (Valor Econômico)." },
      { fato: "A ANEEL aprovou a bandeira vermelha patamar 1 para agosto." },
      { fato: "O preço de compra e de venda do contrato futuro se aproximou." },
    ];

    const { conteudo, descartes } = peneirarItens(legitimos, "teste");
    expect(descartes).toEqual([]);
    expect(conteudo).toHaveLength(legitimos.length);
  });

  it("não descarta um item por causa do endereço da notícia", () => {
    // Manchete vira slug: um link legítimo pode carregar "recomendacao" ou
    // "oportunidade" no caminho. Varrer a URL descartaria a notícia pelo
    // endereço dela, não pelo que ela diz.
    const item = {
      fato: "O Tesouro publicou o relatório mensal da dívida em 08/08.",
      fontes: [{ veiculo: "Valor", data: "08/08", url: "https://x.com/recomendacao-do-dia" }],
    };

    const { conteudo, descartes } = peneirarItens([item], "teste");
    expect(descartes).toEqual([]);
    expect(conteudo).toHaveLength(1);
  });

  it("descarta só o item culpado, não a lista inteira", () => {
    const itens = [
      { fato: "O Copom manteve a Selic em 15,00% (Banco Central, 30/07)." },
      { fato: "Recomendamos migrar para prefixados." },
      { fato: "O IBGE divulgou o IPCA de julho em 08/08." },
    ];

    const { conteudo, descartes } = peneirarItens(itens, "teste");
    expect(descartes).toHaveLength(1);
    expect(conteudo).toHaveLength(2);
    expect(conteudo.map((item) => item.fato)).not.toContain("Recomendamos migrar para prefixados.");
  });

  it("zera um texto solto em violação, e preserva um texto limpo", () => {
    expect(peneirarTexto("Vale a pena entrar agora.", "fio").conteudo).toBe("");
    const limpo = "O trimestre combinou juros altos com inflação em desaceleração.";
    expect(peneirarTexto(limpo, "fio").conteudo).toBe(limpo);
  });

  it("conta itens descartados, não padrões casados", () => {
    // Este item viola dois padrões de uma vez. A tela precisa dizer que saiu
    // UM item — é esse número que docs/RISKS.md manda o operador vigiar para
    // saber se a peneira está pegando demais. O log recebe as duas violações.
    const peneira = peneirarItens([{ fato: "Recomendamos a melhor opção do mês." }], "teste");

    expect(peneira.itensDescartados).toBe(1);
    expect(peneira.descartes.length).toBeGreaterThan(1);
    expect(peneira.conteudo).toEqual([]);
  });

  it("um texto solto descartado conta como um item", () => {
    expect(peneirarTexto("Recomendamos a melhor opção.", "fio").itensDescartados).toBe(1);
    expect(peneirarTexto("O IPCA de julho saiu em 0,26%.", "fio").itensDescartados).toBe(0);
  });
});

describe("conferência de um bloco inteiro", () => {
  it("normaliza e peneira num passo só", () => {
    const { conteudo, descartes, itensDescartados } = conferirBloco("painel", {
      indicadores: [
        { nome: "Selic meta", valor: "15,00%", direcao: "estavel", fonte: "BC" },
        { nome: "Dica do dia", valor: "compre dólar", direcao: "alta", fonte: "ninguém" },
      ],
    });

    const painel = conteudo as Painel;
    expect(itensDescartados).toBe(1);
    expect(descartes.length).toBeGreaterThan(0);
    expect(painel.indicadores.map((i: Indicador) => i.nome)).toEqual(["Selic meta"]);
  });

  it("soma os descartes de um bloco com várias listas", () => {
    const { itensDescartados } = conferirBloco("fio", {
      fio: "O trimestre combinou juros altos com inflação em desaceleração.",
      apendice: {
        fatos: ["Selic mantida em 15,00% em 30/07.", "Recomendamos prefixados."],
        inferencias: [{ texto: "Vale a pena alongar.", confianca: "baixa" }],
        hipoteses: ["Cenário não confirmado."],
        lacunas: [],
      },
    });

    expect(itensDescartados).toBe(2);
  });

  it("descarta o tópico inteiro quando ele viola: cartão pela metade é pior", () => {
    const { conteudo, descartes } = conferirBloco("topico", {
      titulo: "Copom mantém a Selic",
      fato: "Decisão unânime em 30/07 (Banco Central).",
      leitura_investidor: "Recomendamos alongar a carteira.",
    });

    expect(descartes.length).toBeGreaterThan(0);
    expect(conteudo).toBeNull();
  });

  it("mantém o tópico limpo com as fontes intactas", () => {
    const { conteudo, descartes } = conferirBloco("topico", {
      titulo: "Copom mantém a Selic em 15%",
      fato: "Decisão unânime anunciada em 30/07, segundo o Banco Central.",
      leitura_brasil: "O canal de transmissão é o custo do crédito.",
      leitura_investidor: "Prefixados e IPCA+ reprecificam pelo mesmo vetor de juro real.",
      vetor_internacional: "não se aplica",
      corte_regional: "não se aplica",
      confianca: "alta",
      fontes: [{ veiculo: "Banco Central", data: "30/07", url: "https://bcb.gov.br/copom" }],
    });

    const topico = conteudo as Topico;
    expect(descartes).toEqual([]);
    expect(topico.titulo).toContain("Copom");
    expect(topico.fontes).toHaveLength(1);
  });

  it("atende todos os blocos anunciados sem estourar", () => {
    for (const bloco of BLOCOS_API) {
      expect(() => conferirBloco(bloco, {})).not.toThrow();
    }
  });
});

describe("blocos da apuração", () => {
  it("reconhece só os blocos que a rota atende", () => {
    expect(ehBlocoApi("painel")).toBe(true);
    expect(ehBlocoApi("topicos")).toBe(false);
    expect(ehBlocoApi("../../etc/passwd")).toBe(false);
    expect(ehBlocoApi(null)).toBe(false);
  });

  it("liga a busca web em tudo menos na síntese", () => {
    expect(usaBusca("painel")).toBe(true);
    // O fio condutor trabalha sobre o já apurado. Se buscasse, traria fato novo
    // sem fonte no corpo do boletim.
    expect(usaBusca("fio")).toBe(false);
  });
});

describe("limite de uso da apuração", () => {
  it("libera até o teto e barra a partir dele", () => {
    const limitador = criarLimitador({ maximo: 3, janelaMs: 60_000 }, { maximo: 99, janelaMs: 60_000 });
    const agora = 1_000_000;

    for (let i = 0; i < 3; i++) {
      expect(limitador.registrar("1.2.3.4", agora).permitido).toBe(true);
    }
    expect(limitador.registrar("1.2.3.4", agora).permitido).toBe(false);
  });

  it("não conta a chamada barrada contra o limite", () => {
    // Se contasse, quem insiste renovaria o próprio bloqueio para sempre.
    const limitador = criarLimitador({ maximo: 1, janelaMs: 10_000 }, { maximo: 99, janelaMs: 60_000 });
    limitador.registrar("1.2.3.4", 0);
    limitador.registrar("1.2.3.4", 5_000);
    limitador.registrar("1.2.3.4", 9_000);
    expect(limitador.registrar("1.2.3.4", 10_001).permitido).toBe(true);
  });

  it("libera de novo quando a janela passa, e informa quanto esperar", () => {
    const limitador = criarLimitador({ maximo: 1, janelaMs: 60_000 }, { maximo: 99, janelaMs: 60_000 });
    limitador.registrar("1.2.3.4", 0);

    const barrado = limitador.registrar("1.2.3.4", 30_000);
    expect(barrado.permitido).toBe(false);
    if (!barrado.permitido) expect(barrado.esperarSegundos).toBe(30);

    expect(limitador.registrar("1.2.3.4", 60_001).permitido).toBe(true);
  });

  it("conta cada origem separadamente", () => {
    const limitador = criarLimitador({ maximo: 1, janelaMs: 60_000 }, { maximo: 99, janelaMs: 60_000 });
    expect(limitador.registrar("1.1.1.1", 0).permitido).toBe(true);
    expect(limitador.registrar("2.2.2.2", 0).permitido).toBe(true);
    expect(limitador.registrar("1.1.1.1", 0).permitido).toBe(false);
  });

  it("o teto global barra o que o limite por origem deixaria passar", () => {
    // O caso que o limite por origem não cobre: muitos visitantes, um pouco
    // cada, somando uma conta grande.
    const limitador = criarLimitador({ maximo: 10, janelaMs: 60_000 }, { maximo: 2, janelaMs: 60_000 });
    expect(limitador.registrar("1.1.1.1", 0).permitido).toBe(true);
    expect(limitador.registrar("2.2.2.2", 0).permitido).toBe(true);
    expect(limitador.registrar("3.3.3.3", 0).permitido).toBe(false);
  });
});
