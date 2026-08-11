"use client";

/**
 * O boletim de conjuntura, apurado ao vivo.
 *
 * **Por que sequencial, e não em paralelo.** Sete chamadas com busca web
 * disparadas juntas estouram o limite de taxa e voltam todas com 429 — a
 * apuração inteira falha em dez segundos em vez de terminar em cinco minutos.
 * O respiro de 2,5s entre etapas é a diferença entre um boletim e uma tela de
 * erro.
 *
 * **Por que a repescagem mora aqui, e não no servidor.** Uma espera de 30s
 * dentro da rota é uma requisição pendurada, sem nada na tela e sujeita ao
 * timeout da plataforma. Aqui, a etapa diz "repescando em 30s", o usuário vê o
 * que está acontecendo e pode interromper. O custo é o cliente conhecer a
 * política de retentativa; o ganho é a apuração ser observável.
 *
 * **Por que cada etapa falha sozinha.** Um bloco que não fecha não derruba os
 * outros: o trilho marca aquela linha com ✕ e o motivo, e a apuração segue. Um
 * boletim com seis blocos de sete é útil; um boletim que não existe porque uma
 * busca falhou não é.
 *
 * O que esta tela **não** faz: chamar a Anthropic. Prompt, chave e peneira de
 * conformidade ficam em `src/app/api/boletim/`. Daqui sai um `fetch` para o
 * próprio site, e nada mais.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Disclaimer } from "@/components/ui/Disclaimer";
import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";
import { ETAPAS } from "@/domain/boletim/blocos";
import { dataExtenso, horaCurta } from "@/domain/boletim/data";
import type {
  Assunto,
  DecisaoPublica,
  Fio,
  Internacional,
  Painel,
  Pauta,
  Regional,
  Topico,
} from "@/domain/boletim/tipos";

import { Campo, Cartao, Fontes, GrauDeConfianca, Movimento, TituloDeCartao } from "./pecas";

/** Espera entre etapas. Menos que isto e o limite de taxa do modelo reclama. */
const INTERVALO_MS = 2_500;

/** Uma tentativa e três repescagens, com espera crescente. */
const ESPERA_MS = [6_000, 15_000, 30_000] as const;
const TENTATIVAS = 4;

/** Teto do material que volta para a síntese. Acima disso, o custo não se paga. */
const MAX_CONTEXTO = 7_000;

type Situacao = "espera" | "rodando" | "pronto" | "erro";

type EstadoEtapa = {
  readonly situacao: Situacao;
  readonly nota?: string;
};

type Apurado = {
  readonly painel?: Painel;
  readonly topicos: readonly Topico[];
  readonly publica?: DecisaoPublica;
  readonly internacional?: Internacional;
  readonly regional?: Regional;
  readonly fio?: Fio;
};

type RespostaDaRota =
  | { readonly ok: true; readonly conteudo: unknown; readonly descartes: number }
  | { readonly ok: false; readonly erro: string };

type Pedido = {
  readonly bloco: string;
  readonly assunto?: Assunto;
  readonly contexto?: string;
};

const APURADO_VAZIO: Apurado = { topicos: [] };

/** Espera que aceita ser interrompida. Um `setTimeout` solto ignora o cancelamento. */
function dormir(ms: number, sinal: AbortSignal): Promise<void> {
  return new Promise((resolver, rejeitar) => {
    if (sinal.aborted) {
      rejeitar(new DOMException("interrompido", "AbortError"));
      return;
    }
    const id = setTimeout(() => {
      sinal.removeEventListener("abort", cancelar);
      resolver();
    }, ms);
    function cancelar() {
      clearTimeout(id);
      rejeitar(new DOMException("interrompido", "AbortError"));
    }
    sinal.addEventListener("abort", cancelar, { once: true });
  });
}

function ehInterrupcao(causa: unknown): boolean {
  return causa instanceof DOMException && causa.name === "AbortError";
}

function mensagemDe(causa: unknown): string {
  return causa instanceof Error && causa.message ? causa.message : "falha na apuração";
}

/** O que a peneira de conformidade tirou desta etapa. Zero não vira nota. */
function notaDeDescarte(quantidade: number): string | undefined {
  if (quantidade === 0) return undefined;
  return quantidade === 1 ? "1 item descartado" : `${quantidade} itens descartados`;
}

/**
 * A data de hoje, e por que ela não é uma variável comum.
 *
 * Esta página é pré-renderizada no build. Chamar `dataExtenso()` durante o
 * render assaria a data da compilação dentro de `boletim.html`, e todo
 * visitante posterior leria a data errada até a hidratação — com o React ainda
 * acusando divergência de texto. "Hoje" é informação do cliente, e só o cliente
 * sabe qual é.
 *
 * `useSyncExternalStore` é o jeito de dizer isso: o servidor não tem resposta
 * (`null`), o cliente tem, e não há inscrição porque a data não muda sozinha
 * durante a sessão. As três funções vivem fora do componente para manterem
 * identidade estável entre renders.
 */
const SEM_INSCRICAO = () => () => {};
const dataNoCliente = () => dataExtenso();
const dataNoServidor = () => null;

/**
 * Uma etapa, com repescagem.
 *
 * Nem toda falha melhora com insistir: chave ausente (503) e pedido inválido
 * (400) são o mesmo erro nas quatro tentativas, e repescá-los só faz o usuário
 * esperar 51 segundos para ler a mesma mensagem.
 */
async function apurar(
  pedido: Pedido,
  sinal: AbortSignal,
  avisar: (nota: string) => void,
): Promise<{ conteudo: unknown; descartes: number }> {
  let ultimoErro = "falha na apuração";

  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
    if (tentativa > 0) {
      const espera = ESPERA_MS[Math.min(tentativa - 1, ESPERA_MS.length - 1)] ?? 30_000;
      avisar(`repescando em ${Math.round(espera / 1000)}s`);
      await dormir(espera, sinal);
      avisar(`tentativa ${tentativa + 1}`);
    }

    const resposta = await fetch("/api/boletim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pedido, tentativa }),
      signal: sinal,
    });

    // Nem toda resposta é nossa: um 502 do proxy ou uma página de timeout da
    // plataforma chegam como HTML, e `json()` estoura. Deixar o erro escapar
    // aqui pularia a repescagem justamente nas falhas transitórias que ela
    // existe para cobrir — e mostraria "Unexpected token '<'" ao usuário.
    let dados: RespostaDaRota;
    try {
      dados = (await resposta.json()) as RespostaDaRota;
    } catch {
      ultimoErro = `a apuração respondeu ${resposta.status} sem conteúdo utilizável`;
      continue;
    }

    if (dados.ok) return { conteudo: dados.conteudo, descartes: dados.descartes };

    ultimoErro = dados.erro;
    if (resposta.status === 503 || resposta.status === 400) break;
  }

  throw new Error(ultimoErro);
}

const TOM_DA_SITUACAO: Record<Situacao, StatusTone> = {
  espera: "unavailable",
  rodando: "preparing",
  pronto: "identified",
  erro: "missing",
};

const MARCA_DA_SITUACAO: Record<Situacao, string> = {
  espera: "○",
  rodando: "●",
  pronto: "✓",
  erro: "✕",
};

const PALAVRA_DA_SITUACAO: Record<Situacao, string> = {
  espera: "na fila",
  rodando: "apurando",
  pronto: "pronto",
  erro: "falhou",
};

export function Boletim() {
  const [estados, setEstados] = useState<Record<string, EstadoEtapa>>({});
  const [dados, setDados] = useState<Apurado>(APURADO_VAZIO);
  const [rodando, setRodando] = useState(false);
  const [carimbo, setCarimbo] = useState<string | null>(null);
  const [decorrido, setDecorrido] = useState(0);
  const [descartes, setDescartes] = useState(0);
  const [copiado, setCopiado] = useState(false);
  /** `null` enquanto a checagem não voltou: o botão não aparece antes disso. */
  const [disponivel, setDisponivel] = useState<boolean | null>(null);
  /** Ver o bloco de comentário sobre `dataNoCliente`. */
  const hoje = useSyncExternalStore(SEM_INSCRICAO, dataNoCliente, dataNoServidor);

  const inicio = useRef<number | null>(null);
  const controle = useRef<AbortController | null>(null);
  /** O acumulado precisa ser lido de forma síncrona para montar o contexto da síntese. */
  const acumulado = useRef<Apurado>(APURADO_VAZIO);

  /* A apuração é longa; sem cronômetro, uma etapa em repescagem parece travada. */
  useEffect(() => {
    if (!rodando) return;
    const id = setInterval(() => {
      if (inicio.current !== null) {
        setDecorrido(Math.floor((Date.now() - inicio.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [rodando]);

  /* Num deploy sem ANTHROPIC_API_KEY — o padrão deste site — não há o que apurar. */
  useEffect(() => {
    let vivo = true;
    fetch("/api/boletim")
      .then((resposta) => resposta.json() as Promise<{ disponivel?: boolean }>)
      .then((corpo) => {
        if (vivo) setDisponivel(Boolean(corpo.disponivel));
      })
      .catch(() => {
        if (vivo) setDisponivel(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  /* Sair da página no meio da apuração não deve deixar chamadas em voo. */
  useEffect(() => () => controle.current?.abort(), []);

  const marcar = useCallback((etapa: string, situacao: Situacao, nota?: string) => {
    setEstados((atual) => ({ ...atual, [etapa]: { situacao, ...(nota ? { nota } : {}) } }));
  }, []);

  const guardar = useCallback((parcial: Partial<Apurado>) => {
    acumulado.current = { ...acumulado.current, ...parcial };
    setDados(acumulado.current);
  }, []);

  const interromper = useCallback(() => controle.current?.abort(), []);

  const gerar = useCallback(async () => {
    const cancelamento = new AbortController();
    controle.current = cancelamento;
    const sinal = cancelamento.signal;

    setEstados({});
    setDados(APURADO_VAZIO);
    setDescartes(0);
    setCarimbo(null);
    setCopiado(false);
    acumulado.current = APURADO_VAZIO;
    inicio.current = Date.now();
    setDecorrido(0);
    setRodando(true);

    /** Roda uma etapa. Devolve `null` quando ela falha — a apuração segue. */
    const etapa = async (
      id: string,
      pedido: Pedido,
      recolher: (conteudo: unknown) => void,
    ): Promise<unknown | null> => {
      marcar(id, "rodando");
      try {
        const resultado = await apurar(pedido, sinal, (nota) => marcar(id, "rodando", nota));
        setDescartes((total) => total + resultado.descartes);
        recolher(resultado.conteudo);
        marcar(id, "pronto", notaDeDescarte(resultado.descartes));
        return resultado.conteudo;
      } catch (causa) {
        if (ehInterrupcao(causa)) throw causa;
        marcar(id, "erro", mensagemDe(causa));
        return null;
      }
    };

    try {
      await etapa("painel", { bloco: "painel" }, (conteudo) =>
        guardar({ painel: conteudo as Painel }),
      );
      await dormir(INTERVALO_MS, sinal);

      const pauta = (await etapa("pauta", { bloco: "pauta" }, () => {})) as Pauta | null;
      await dormir(INTERVALO_MS, sinal);

      // O aprofundamento é um assunto por chamada: o schema do tópico pede duas
      // fontes com URL real, e pedir isso para três assuntos numa resposta só
      // é o caminho mais curto para o truncamento.
      const assuntos = pauta?.topicos ?? [];
      if (assuntos.length === 0) {
        marcar("topicos", "erro", "pauta não apurada");
      } else {
        const colhidos: Topico[] = [];

        for (const [indice, assunto] of assuntos.entries()) {
          const posicao = `assunto ${indice + 1} de ${assuntos.length}`;
          marcar("topicos", "rodando", posicao);

          try {
            const resultado = await apurar({ bloco: "topico", assunto }, sinal, (nota) =>
              marcar("topicos", "rodando", `${posicao} · ${nota}`),
            );
            setDescartes((total) => total + resultado.descartes);
            // `null` aqui é a peneira de conformidade tendo descartado o cartão
            // inteiro — não é falha de apuração, e o contador já registrou.
            if (resultado.conteudo !== null) {
              colhidos.push(resultado.conteudo as Topico);
              guardar({ topicos: [...colhidos] });
            }
          } catch (causa) {
            if (ehInterrupcao(causa)) throw causa;
            // Um assunto perdido não custa os outros dois.
          }

          if (indice < assuntos.length - 1) await dormir(INTERVALO_MS, sinal);
        }

        marcar(
          "topicos",
          colhidos.length > 0 ? "pronto" : "erro",
          colhidos.length === assuntos.length
            ? undefined
            : `${colhidos.length} de ${assuntos.length} apurados`,
        );
      }
      await dormir(INTERVALO_MS, sinal);

      await etapa("publica", { bloco: "publica" }, (conteudo) =>
        guardar({ publica: conteudo as DecisaoPublica }),
      );
      await dormir(INTERVALO_MS, sinal);

      await etapa("internacional", { bloco: "internacional" }, (conteudo) =>
        guardar({ internacional: conteudo as Internacional }),
      );
      await dormir(INTERVALO_MS, sinal);

      await etapa("regional", { bloco: "regional" }, (conteudo) =>
        guardar({ regional: conteudo as Regional }),
      );
      await dormir(INTERVALO_MS, sinal);

      const contexto = JSON.stringify({
        topicos: acumulado.current.topicos,
        publica: acumulado.current.publica ?? null,
        internacional: acumulado.current.internacional ?? null,
        regional: acumulado.current.regional ?? null,
      }).slice(0, MAX_CONTEXTO);

      await etapa("fio", { bloco: "fio", contexto }, (conteudo) =>
        guardar({ fio: conteudo as Fio }),
      );

      setCarimbo(horaCurta());
    } catch (causa) {
      if (!ehInterrupcao(causa)) throw causa;
      setEstados((atual) => {
        const proximo = { ...atual };
        for (const { id } of ETAPAS) {
          if ((proximo[id]?.situacao ?? "espera") !== "pronto") {
            proximo[id] = { situacao: "erro", nota: "interrompida" };
          }
        }
        return proximo;
      });
    } finally {
      controle.current = null;
      setRodando(false);
    }
  }, [guardar, marcar]);

  const copiar = useCallback(async () => {
    const linhas: string[] = [`BOLETIM DE CONJUNTURA — ${dataExtenso()}`];

    if (dados.painel && dados.painel.indicadores.length > 0) {
      linhas.push("", "PAINEL");
      for (const indicador of dados.painel.indicadores) {
        const variacao = indicador.variacao ? ` (${indicador.variacao})` : "";
        linhas.push(
          `- ${indicador.nome}: ${indicador.valor}${variacao} [${indicador.fonte || "sem fonte"}]`,
        );
      }
    }

    for (const topico of dados.topicos) {
      linhas.push("", topico.titulo.toUpperCase(), topico.fato);
      if (topico.leitura_brasil) linhas.push(`Brasil: ${topico.leitura_brasil}`);
      if (topico.leitura_investidor) linhas.push(`Investidor: ${topico.leitura_investidor}`);
      for (const fonte of topico.fontes) {
        linhas.push(`  fonte: ${fonte.veiculo} ${fonte.data} ${fonte.url ?? ""}`.trimEnd());
      }
    }

    if (dados.fio?.fio) linhas.push("", "FIO CONDUTOR", dados.fio.fio);

    try {
      await navigator.clipboard.writeText(linhas.join("\n"));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2_500);
    } catch {
      // Área de transferência negada pelo navegador. O botão não finge sucesso.
      setCopiado(false);
    }
  }, [dados]);

  const temAlgo =
    Boolean(dados.painel ?? dados.publica ?? dados.internacional ?? dados.regional ?? dados.fio) ||
    dados.topicos.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-28 sm:px-10">
      <header className="border-b border-edge pb-8">
        <p className="tech text-amber">Leitura de conjuntura · Brasil</p>
        <h1 className="mt-3 text-4xl leading-[1.05] sm:text-5xl">Boletim diário</h1>
        <p className="mt-4 min-h-4 font-mono text-xs text-tertiary">
          {hoje ?? ""}
          {hoje && carimbo ? ` · apurado às ${carimbo}` : ""}
        </p>
      </header>

      <div className="no-print mt-8 flex flex-wrap items-center gap-3">
        {disponivel === true ? (
          <button
            type="button"
            onClick={() => void gerar()}
            disabled={rodando}
            className="bg-light px-6 py-3 text-sm font-semibold text-abyss transition-opacity duration-300 disabled:cursor-wait disabled:opacity-60"
          >
            {rodando
              ? `Apurando… ${decorrido}s`
              : temAlgo
                ? "Apurar de novo"
                : "Apurar o boletim de hoje"}
          </button>
        ) : null}

        {rodando ? (
          <button
            type="button"
            onClick={interromper}
            className="border border-edge px-5 py-3 text-sm text-aux transition-colors duration-300 hover:border-light hover:text-light"
          >
            Interromper
          </button>
        ) : null}

        {temAlgo && !rodando ? (
          <>
            <button
              type="button"
              onClick={() => void copiar()}
              className="border border-edge px-5 py-3 text-sm text-aux transition-colors duration-300 hover:border-light hover:text-light"
            >
              {copiado ? "Copiado" : "Copiar texto"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="border border-edge px-5 py-3 text-sm text-aux transition-colors duration-300 hover:border-light hover:text-light"
            >
              Salvar em PDF
            </button>
          </>
        ) : null}
      </div>

      {disponivel === false ? (
        <div className="plate-inset mt-8 p-6">
          <p className="tech text-st-attention">Apuração desligada</p>
          <p className="mt-3 text-base leading-relaxed text-body">
            Este ambiente não tem <code className="font-mono text-sm text-aux">ANTHROPIC_API_KEY</code>{" "}
            definida, então a apuração ao vivo está desligada e o resto do site segue funcionando
            como antes. Defina a variável no ambiente do servidor para ligar esta página.
          </p>
        </div>
      ) : null}

      {rodando || temAlgo ? (
        <section aria-label="Andamento da apuração" className="no-print plate mt-10 p-5">
          <p className="tech text-tertiary">Apuração</p>
          <ul className="mt-4 grid gap-y-3 sm:grid-cols-2 sm:gap-x-8">
            {ETAPAS.map((etapa) => {
              const estado = estados[etapa.id]?.situacao ?? "espera";
              return (
                <li key={etapa.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span aria-hidden="true" className="font-mono text-xs text-tertiary">
                    {MARCA_DA_SITUACAO[estado]}
                  </span>
                  <span
                    className={`text-sm ${estado === "espera" ? "text-muted" : "text-body"}`}
                  >
                    {etapa.rotulo}
                  </span>
                  <StatusPill
                    tone={TOM_DA_SITUACAO[estado]}
                    label={PALAVRA_DA_SITUACAO[estado]}
                  />
                  {estados[etapa.id]?.nota ? (
                    <span className="font-mono text-xs text-tertiary">
                      {estados[etapa.id]?.nota}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {descartes > 0 ? (
            <p className="mt-5 border-t border-edge-soft pt-4 text-sm leading-relaxed text-aux">
              A varredura de conformidade retirou {descartes}{" "}
              {descartes === 1 ? "item" : "itens"} desta apuração. O critério é o mesmo do resto do
              site — o texto retirado fica no log do servidor.
            </p>
          ) : null}
        </section>
      ) : null}

      {!temAlgo && !rodando && disponivel !== false ? (
        <div className="plate-inset mt-10 p-6">
          <p className="text-base leading-relaxed text-body">
            Nenhum boletim apurado ainda. A apuração consulta fontes ao vivo — imprensa econômica,
            órgãos oficiais e imprensa regional — em sete etapas, uma de cada vez. Leva de quatro a
            seis minutos.
          </p>
          <p className="mt-4 text-base leading-relaxed text-aux">
            Cobertura: últimas 48 horas. Cada afirmação vem com veículo e data, e o que não for
            localizado aparece como não localizado, nunca como estimativa. Se uma etapa falhar, ela
            é repescada até três vezes e as demais seguem.
          </p>
          <Disclaimer className="mt-4" />
        </div>
      ) : null}

      {dados.painel && dados.painel.indicadores.length > 0 ? (
        <section aria-labelledby="painel-titulo" className="mt-16">
          <p className="tech text-amber">Onde o mercado abriu</p>
          <h2 id="painel-titulo" className="mt-3 text-2xl sm:text-3xl">
            Painel
          </h2>

          <ul className="plate mt-6">
            {dados.painel.indicadores.map((indicador, indice) => (
              <li
                key={`${indicador.nome}-${indice}`}
                className={`flex items-baseline justify-between gap-4 px-5 py-4 ${
                  indice > 0 ? "border-t border-edge-soft" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-base text-body">{indicador.nome}</p>
                  <p className="mt-0.5 truncate font-mono text-xs text-muted">
                    {indicador.fonte || "fonte não informada"}
                    {indicador.data ? ` · ${indicador.data}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular font-mono text-base text-title">{indicador.valor}</p>
                  <p className="mt-0.5">
                    <Movimento direcao={indicador.direcao} variacao={indicador.variacao} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {dados.topicos.length > 0 ? (
        <section aria-labelledby="movimentos-titulo" className="mt-16">
          <p className="tech text-amber">O que moveu a discussão</p>
          <h2 id="movimentos-titulo" className="mt-3 text-2xl sm:text-3xl">
            Movimentos do dia
          </h2>

          <div className="mt-6 grid gap-4">
            {dados.topicos.map((topico, indice) => (
              <Cartao key={`${topico.titulo}-${indice}`}>
                <TituloDeCartao>{topico.titulo}</TituloDeCartao>
                <Campo rotulo="O que aconteceu">{topico.fato}</Campo>
                <Campo rotulo="Leitura para o Brasil">{topico.leitura_brasil}</Campo>
                <Campo rotulo="Leitura para o investidor">{topico.leitura_investidor}</Campo>
                <Campo rotulo="Vetor internacional">{topico.vetor_internacional}</Campo>
                <Campo rotulo="Corte regional">{topico.corte_regional}</Campo>
                {topico.confianca ? (
                  <p className="mt-5">
                    <GrauDeConfianca confianca={topico.confianca} />
                  </p>
                ) : null}
                <Fontes lista={topico.fontes} />
              </Cartao>
            ))}
          </div>
        </section>
      ) : null}

      {dados.publica && dados.publica.itens.length > 0 ? (
        <section aria-labelledby="publica-titulo" className="mt-16">
          <p className="tech text-amber">Governo, Congresso e agências</p>
          <h2 id="publica-titulo" className="mt-3 text-2xl sm:text-3xl">
            Decisão pública
          </h2>

          <div className="mt-6 grid gap-4">
            {dados.publica.itens.map((item, indice) => (
              <Cartao key={`${item.titulo}-${indice}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <TituloDeCartao>{item.titulo}</TituloDeCartao>
                  {item.estagio ? <StatusPill tone="attention" label={item.estagio} /> : null}
                </div>
                <Campo rotulo="O que aconteceu">{item.fato}</Campo>
                <Campo rotulo="Impacto">{item.impacto}</Campo>
                <Fontes lista={item.fontes} />
              </Cartao>
            ))}
          </div>
        </section>
      ) : null}

      {dados.internacional && dados.internacional.itens.length > 0 ? (
        <section aria-labelledby="internacional-titulo" className="mt-16">
          <p className="tech text-amber">O que chega de fora</p>
          <h2 id="internacional-titulo" className="mt-3 text-2xl sm:text-3xl">
            Frente internacional
          </h2>

          <div className="mt-6 grid gap-4">
            {dados.internacional.itens.map((item, indice) => (
              <Cartao key={`${item.titulo}-${indice}`}>
                <TituloDeCartao>{item.titulo}</TituloDeCartao>
                <Campo rotulo="O que aconteceu">{item.fato}</Campo>
                <Campo rotulo="Canal de transmissão">{item.canal_transmissao}</Campo>
                <Campo rotulo="Efeito no Brasil">{item.efeito_brasil}</Campo>
                <Fontes lista={item.fontes} />
              </Cartao>
            ))}
          </div>
        </section>
      ) : null}

      {dados.regional ? (
        <section aria-labelledby="regional-titulo" className="mt-16">
          <p className="tech text-amber">Recorte regional</p>
          <h2 id="regional-titulo" className="mt-3 text-2xl sm:text-3xl">
            Nordeste e Alagoas
          </h2>

          {dados.regional.itens.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {dados.regional.itens.map((item, indice) => (
                <Cartao key={`${item.titulo}-${indice}`}>
                  <TituloDeCartao>{item.titulo}</TituloDeCartao>
                  <Campo rotulo="O que aconteceu">{item.fato}</Campo>
                  <Campo rotulo="Impacto">{item.impacto}</Campo>
                  <Fontes lista={item.fontes} />
                </Cartao>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-base leading-relaxed text-aux">
              {dados.regional.nota ||
                "Sem movimento regional localizado nas últimas 48 horas."}
            </p>
          )}
        </section>
      ) : null}

      {dados.fio?.fio ? (
        <section aria-labelledby="fio-titulo" className="mt-16">
          <p className="tech text-amber">Como as peças se ligam</p>
          <h2 id="fio-titulo" className="mt-3 text-2xl sm:text-3xl">
            Fio condutor
          </h2>
          <p className="plate-inset mt-6 p-6 text-base leading-relaxed text-body">
            {dados.fio.fio}
          </p>
        </section>
      ) : null}

      {dados.fio?.apendice ? (
        <section aria-labelledby="apendice-titulo" className="mt-16">
          <p className="tech text-amber">Fora do corpo do boletim</p>
          <h2 id="apendice-titulo" className="mt-3 text-2xl sm:text-3xl">
            Apêndice metodológico
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-aux">
            Separar o que foi verificado do que foi deduzido é o que impede uma leitura de
            conjuntura de passar por apuração.
          </p>

          <div className="plate mt-6 p-6">
            {(
              [
                ["Fatos verificados", dados.fio.apendice.fatos],
                ["Hipóteses", dados.fio.apendice.hipoteses],
                ["Lacunas de apuração", dados.fio.apendice.lacunas],
              ] as const
            ).map(([rotulo, itens]) =>
              itens.length > 0 ? (
                <div key={rotulo} className="mb-6 last:mb-0">
                  <p className="tech text-tertiary">{rotulo}</p>
                  <ul className="mt-2 grid gap-2">
                    {itens.map((item, indice) => (
                      <li
                        key={`${rotulo}-${indice}`}
                        className="border-l-2 border-edge pl-4 text-base leading-relaxed text-body"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}

            {dados.fio.apendice.inferencias.length > 0 ? (
              <div>
                <p className="tech text-tertiary">Inferências</p>
                <ul className="mt-2 grid gap-3">
                  {dados.fio.apendice.inferencias.map((inferencia, indice) => (
                    <li
                      key={`inferencia-${indice}`}
                      className="border-l-2 border-amber-deep pl-4 text-base leading-relaxed text-body"
                    >
                      {inferencia.texto}
                      {inferencia.confianca ? (
                        <span className="ml-2 inline-block align-middle">
                          <GrauDeConfianca confianca={inferencia.confianca} />
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {temAlgo ? (
        <footer className="mt-16 border-t border-edge pt-8">
          <Disclaimer variant="short" />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Material descritivo de conjuntura, apurado por consulta automatizada a fontes
            públicas. Não é análise de valores mobiliários nos termos da Resolução CVM 20, nem
            oferta de ativos. Confira as fontes antes de citar qualquer número.
          </p>
        </footer>
      ) : null}
    </div>
  );
}
