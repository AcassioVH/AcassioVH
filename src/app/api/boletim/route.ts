/**
 * A apuração de um bloco do boletim.
 *
 * Esta rota é a primeira exceção à arquitetura estática do site, e vale
 * registrar o que ela custa: até aqui, `npm run build` produzia arquivos que
 * qualquer hospedagem serve, sem variável de ambiente obrigatória. O boletim
 * exige um servidor Node e uma chave de API. O resto do site continua estático
 * — a exceção é uma rota, não uma mudança de modelo.
 *
 * A chave fica aqui e só aqui. O componente de tela conversa com este endereço,
 * nunca com a Anthropic: uma chave de API num bundle de navegador é uma chave
 * publicada, e não existe ofuscação que resolva isso.
 *
 * Uma chamada por requisição, de propósito. A repescagem mora no cliente, onde
 * o usuário vê a etapa dizer "repescando em 15s" e pode desistir — dentro da
 * rota, a mesma espera seria uma requisição pendurada até o timeout da
 * plataforma, sem nada na tela.
 */

import Anthropic from "@anthropic-ai/sdk";

import { ehBlocoApi, usaBusca, type BlocoApi } from "@/domain/boletim/blocos";
import { conferirBloco } from "@/domain/boletim/conferir";
import { dataExtenso } from "@/domain/boletim/data";
import { criarLimitador } from "@/domain/boletim/limite";
import { extrairJson } from "@/domain/json/extrair";

import { promptDoBloco } from "./prompts";

export const runtime = "nodejs";
/**
 * Busca web mais raciocínio adaptativo levam bem mais que os 10s padrão de
 * algumas plataformas. 120s é folgado para um bloco e ainda curto o bastante
 * para a etapa falhar em vez de pendurar a tela.
 */
export const maxDuration = 120;

/**
 * Sonnet 5, e não Opus, porque o trabalho é buscar, ler e extrair — muito token
 * de entrada, pouco julgamento difícil. É também o que a versão anterior deste
 * boletim já usava (Sonnet 4.6). Trocar por `claude-opus-5` é mudar esta linha:
 * o resto do código não sabe qual modelo respondeu.
 */
const MODELO = "claude-sonnet-5";

/**
 * Teto de saída por bloco.
 *
 * Precisa ser generoso: em Sonnet 5 o raciocínio adaptativo vem ligado por
 * padrão e divide este orçamento com o texto. Com o teto apertado, o modelo
 * gasta pensando e o JSON sai cortado — que é exatamente o defeito que
 * `repararJson` remenda, e é melhor não produzir.
 */
const MAX_TOKENS = 8_000;

/** Uma pausa do lado do servidor de ferramentas não é erro: é "continue". */
const MAX_CONTINUACOES = 4;

/** Teto do material que o bloco `fio` recebe de volta. Protege o contexto e o custo. */
const MAX_CONTEXTO = 8_000;

const limitador = criarLimitador();

/** Corpo aceito pela rota. Tudo que vem do cliente é suspeito até ser conferido. */
type Pedido = {
  readonly bloco: BlocoApi;
  readonly assunto?: { readonly titulo: string; readonly resumo: string };
  readonly contexto?: string;
  readonly tentativa: number;
};

function erro(mensagem: string, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ ok: false, erro: mensagem, ...extra }, { status });
}

function textoCurto(valor: unknown, teto: number): string {
  return typeof valor === "string" ? valor.slice(0, teto) : "";
}

function lerPedido(corpo: unknown): Pedido | null {
  if (typeof corpo !== "object" || corpo === null) return null;
  const campos = corpo as Record<string, unknown>;
  if (!ehBlocoApi(campos.bloco)) return null;

  const assuntoBruto = campos.assunto;
  const assunto =
    typeof assuntoBruto === "object" && assuntoBruto !== null
      ? {
          titulo: textoCurto((assuntoBruto as Record<string, unknown>).titulo, 300),
          resumo: textoCurto((assuntoBruto as Record<string, unknown>).resumo, 600),
        }
      : undefined;

  const tentativa = typeof campos.tentativa === "number" ? campos.tentativa : 0;

  return {
    bloco: campos.bloco,
    ...(assunto ? { assunto } : {}),
    contexto: textoCurto(campos.contexto, MAX_CONTEXTO),
    tentativa: Number.isFinite(tentativa) ? Math.min(Math.max(0, tentativa), 5) : 0,
  };
}

/**
 * Quem está pedindo.
 *
 * `x-forwarded-for` é cabeçalho e portanto forjável — quem quiser furar o
 * limite troca de valor a cada requisição. Serve para separar visitantes
 * distintos, não para identificar ninguém. Quem segura o gasto de verdade é o
 * limite global e a cota da chave.
 */
function origemDe(request: Request): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  const primeiro = encaminhado?.split(",")[0]?.trim();
  return primeiro && primeiro.length > 0 ? primeiro : "desconhecida";
}

/** Junta os blocos de texto da resposta. Blocos de busca e raciocínio ficam de fora. */
function textoDaResposta(mensagem: Anthropic.Message): string {
  return mensagem.content
    .filter((bloco): bloco is Anthropic.TextBlock => bloco.type === "text")
    .map((bloco) => bloco.text)
    .join("\n");
}

/**
 * Pergunta ao modelo, atravessando as pausas.
 *
 * Ferramenta de servidor tem teto de iterações: ao bater nele, a resposta volta
 * com `stop_reason: "pause_turn"` e conteúdo pela metade. Reenviar a conversa
 * com o turno do assistente anexado retoma de onde parou. Sem este laço, uma
 * busca mais longa vira JSON truncado e a etapa falha sem motivo aparente.
 */
async function perguntar(cliente: Anthropic, bloco: BlocoApi, prompt: string) {
  const mensagens: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  const ferramentas: Anthropic.ToolUnion[] = usaBusca(bloco)
    ? [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }]
    : [];

  let resposta = await cliente.messages.create({
    model: MODELO,
    max_tokens: MAX_TOKENS,
    output_config: { effort: "medium" },
    messages: mensagens,
    ...(ferramentas.length > 0 ? { tools: ferramentas } : {}),
  });

  for (let i = 0; resposta.stop_reason === "pause_turn" && i < MAX_CONTINUACOES; i++) {
    mensagens.push({ role: "assistant", content: resposta.content });
    resposta = await cliente.messages.create({
      model: MODELO,
      max_tokens: MAX_TOKENS,
      output_config: { effort: "medium" },
      messages: mensagens,
      ...(ferramentas.length > 0 ? { tools: ferramentas } : {}),
    });
  }

  return resposta;
}

/**
 * Diz se a apuração está ligada, sem gastar chamada.
 *
 * A tela pergunta isto antes de mostrar o botão: num deploy sem chave — que é o
 * deploy padrão deste site — o botão não deve existir, em vez de existir e
 * falhar sete vezes seguidas.
 */
export function GET() {
  return Response.json({ disponivel: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) {
    return erro("Apuração não configurada neste ambiente: falta ANTHROPIC_API_KEY.", 503);
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return erro("Corpo inválido.", 400);
  }

  const pedido = lerPedido(corpo);
  if (!pedido) return erro("Bloco desconhecido.", 400);

  const veredito = limitador.registrar(origemDe(request));
  if (!veredito.permitido) {
    return erro("Limite de apuração atingido. Tente mais tarde.", 429, {
      esperarSegundos: veredito.esperarSegundos,
    });
  }

  const prompt = promptDoBloco(pedido.bloco, {
    hoje: dataExtenso(),
    ...(pedido.assunto ? { assunto: pedido.assunto } : {}),
    ...(pedido.contexto ? { contexto: pedido.contexto } : {}),
    tentativa: pedido.tentativa,
  });

  let resposta: Anthropic.Message;
  try {
    resposta = await perguntar(new Anthropic({ apiKey: chave }), pedido.bloco, prompt);
  } catch (causa) {
    if (causa instanceof Anthropic.RateLimitError) {
      return erro("Limite de chamadas do modelo. Aguarde e tente de novo.", 429);
    }
    if (causa instanceof Anthropic.APIError) {
      // A mensagem do provedor pode carregar detalhe de conta; fica no log.
      console.error(`boletim/${pedido.bloco}: erro ${causa.status} da API`, causa.message);
      return erro("A apuração falhou no provedor do modelo.", 502);
    }
    console.error(`boletim/${pedido.bloco}: falha inesperada`, causa);
    return erro("A apuração falhou.", 502);
  }

  if (resposta.stop_reason === "refusal") {
    return erro("O modelo recusou apurar este bloco.", 422);
  }

  let bruto: unknown;
  try {
    bruto = extrairJson(textoDaResposta(resposta));
  } catch {
    return erro("A resposta não trouxe JSON aproveitável.", 422);
  }

  const { conteudo, descartes, itensDescartados } = conferirBloco(pedido.bloco, bruto);

  // O que a peneira tirou não vai para a tela, mas o operador precisa saber que
  // saiu — e o log guarda o trecho, que é o que permite ajustar o prompt.
  if (itensDescartados > 0) {
    console.warn(
      `boletim/${pedido.bloco}: ${itensDescartados} item(ns) descartado(s) pela conformidade`,
      descartes,
    );
  }

  return Response.json({
    ok: true,
    conteudo,
    // A tela conta itens, não padrões casados: um item pode violar vários.
    descartes: itensDescartados,
    truncado: resposta.stop_reason === "max_tokens",
  });
}
