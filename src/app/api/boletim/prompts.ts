/**
 * Os prompts da apuração.
 *
 * **Este módulo é de servidor, e a localização é o mecanismo.** Ele vive dentro
 * de `src/app/api/`, onde o bundler nunca o manda para o navegador. Isso
 * importa por dois motivos, e nenhum é estético:
 *
 * 1. O texto abaixo usa o vocabulário que a varredura de conformidade proíbe —
 *    precisa usar, porque é ele que instrui o modelo a *não* recomendar. Se
 *    fosse para um componente de cliente, apareceria no HTML publicado e
 *    quebraria `npm run varrer:html`, com razão.
 * 2. Prompt é a regra do produto. No cliente, ele é editável por quem abrir o
 *    DevTools, e a instrução "não recomende" viraria sugestão.
 *
 * A segunda barreira contra recomendação está em `src/domain/boletim/
 * conformidade.ts`, e ela não depende de o modelo obedecer a nada disto.
 */

import type { BlocoApi } from "@/domain/boletim/blocos";

/**
 * O preâmbulo comum, e o contrato inteiro do boletim está aqui.
 *
 * "Nenhum número sem fonte" e "não localizado em vez de estimativa" são as duas
 * linhas que separam um boletim de conjuntura de um texto que inventa. As
 * demais regras derivam delas.
 */
const BASE = (hoje: string) => `Hoje é ${hoje}. Você é analista econômico sênior.

Este material será lido por um assessor de investimentos brasileiro para sustentar conversas com colegas e clientes. NÃO é recomendação: nunca sugira comprar, vender, alocar ou realocar, e nunca emita juízo sobre um ativo específico. Descreva mecanismos, não condutas.

REGRAS INEGOCIÁVEIS:
- Use a busca web antes de responder. Não responda de memória: o que você lembra está desatualizado.
- Cobertura: últimas 48 horas.
- Nenhum número sem fonte identificada (veículo e data).
- Se não localizar, escreva "não localizado". Jamais preencha lacuna com estimativa.
- Rumor, negociação em curso ou "fontes disseram" vem rotulado como não confirmado.
- Prefira: Banco Central, IBGE, Tesouro, ANBIMA, B3, CVM, ANEEL, ANP, ministérios, Reuters, Valor Econômico, InfoMoney, Agência Brasil, Estadão, Exame, Poder360, CNN Brasil Business, Bloomberg, Financial Times.

Responda APENAS com JSON válido. Sem crases, sem markdown, sem texto antes ou depois.`;

const painel = (hoje: string) => `${BASE(hoje)}

BLOCO: Painel de abertura.
Levante os 5 indicadores brasileiros mais relevantes hoje. Priorize nesta ordem: Selic meta, USD/BRL, Ibovespa, IPCA acumulado 12 meses, e uma commodity que se moveu.

Schema:
{"indicadores":[{"nome":"","valor":"","variacao":"","direcao":"alta|baixa|estavel","fonte":"","data":""}]}

Exatamente 5 indicadores, nunca mais. Campo "fonte" com no máximo 4 palavras.`;

const pauta = (hoje: string) => `${BASE(hoje)}

BLOCO: Pauta do dia.
Identifique os 3 assuntos econômicos de maior repercussão no Brasil nas últimas 48 horas.
Não use categorias fixas. Traga o que efetivamente move a discussão hoje, seja política monetária, fiscal, setorial, corporativo, regulatório, energia, commodities, minerais críticos, indústria, infraestrutura ou geopolítica com efeito no país.

Schema: {"topicos":[{"titulo":"","resumo":""}]}
"titulo" objetivo, até 12 palavras. "resumo" uma frase.`;

const topico = (hoje: string, assunto: { titulo: string; resumo: string }) => `${BASE(hoje)}

BLOCO: Desenvolvimento de assunto.
Assunto: ${assunto.titulo}
Contexto: ${assunto.resumo}

Schema:
{"titulo":"","fato":"","fontes":[{"veiculo":"","data":"","url":""}],"leitura_brasil":"","leitura_investidor":"","vetor_internacional":"","corte_regional":"","confianca":"alta|media|baixa"}

- fato: o que aconteceu, com números e datas. Máximo 3 frases.
- fontes: exatamente 2 independentes, com URL real devolvida pela busca.
- leitura_brasil: canal de transmissão macro (câmbio, juros, inflação, fiscal, atividade, confiança). Máximo 2 frases.
- leitura_investidor: quais classes de ativo e setores sentem, e por qual mecanismo. Descritivo, sem recomendar, sem dizer o que fazer. Máximo 2 frases.
- vetor_internacional: origem externa e canal de chegada ao Brasil. Use "não se aplica" se for doméstico.
- corte_regional: efeito no Nordeste ou em Alagoas. Use "não se aplica" se não houver.

Os campos vetor_internacional e corte_regional têm 1 frase cada. Seja denso: corte adjetivo, jamais corte fonte ou número.`;

const publica = (hoje: string) => `${BASE(hoje)}

BLOCO: Decisão pública e regulação.
Levante o que governo federal, Congresso, STF e agências reguladoras decidiram ou movimentaram nas últimas 48 horas com efeito econômico: medidas provisórias, projetos, reforma tributária, regulação setorial, leilões, orçamento, decisões judiciais de impacto fiscal.

Schema: {"itens":[{"titulo":"","fato":"","estagio":"anunciado|em tramitação|em vigor","impacto":"","fontes":[{"veiculo":"","data":"","url":""}]}]}

Máximo 2 itens, 1 fonte cada, campos de no máximo 2 frases. Distinga rigorosamente anúncio de execução no campo "estagio".`;

const internacional = (hoje: string) => `${BASE(hoje)}

BLOCO: Frente internacional.
Levante eventos externos das últimas 48 horas que chegam ao Brasil: bancos centrais, dados dos EUA e da China, tarifas, geopolítica, commodities globais, fluxo para emergentes.

Schema: {"itens":[{"titulo":"","fato":"","canal_transmissao":"","efeito_brasil":"","fontes":[{"veiculo":"","data":"","url":""}]}]}

Máximo 2 itens, 1 fonte cada, campos de no máximo 2 frases. "canal_transmissao": o mecanismo concreto pelo qual chega (câmbio, termos de troca, fluxo de capital, preço de commodity, apetite a risco).`;

const regional = (hoje: string) => `${BASE(hoje)}

BLOCO: Nordeste e Alagoas.
Levante notícias econômicas das últimas 48 horas sobre o Nordeste e especificamente Alagoas: investimentos, energia renovável, indústria, agronegócio, portos, turismo, finanças públicas estaduais, Sudene, Banco do Nordeste.
Consulte também fontes regionais: Gazeta de Alagoas, Cada Minuto, TNH1, Diário de Pernambuco, Jornal do Commercio, portais de governo estadual, Sudene, BNB.

Schema: {"itens":[{"titulo":"","fato":"","impacto":"","fontes":[{"veiculo":"","data":"","url":""}]}],"nota":""}

Máximo 2 itens, 1 fonte cada, campos de no máximo 2 frases. Se não houver movimento relevante, devolva "itens":[] e explique em "nota". Não invente para preencher.`;

/**
 * A síntese, e é o único bloco que não busca nada.
 *
 * Ele trabalha sobre o material já apurado, e a separação é deliberada: se
 * pudesse buscar, traria fato novo sem fonte no corpo do boletim, e o apêndice
 * deixaria de descrever o que foi de fato apurado.
 */
const fio = (hoje: string, contexto: string) => `Hoje é ${hoje}. Você é analista econômico sênior.

BLOCO: Fio condutor e apêndice metodológico.
Abaixo está o material já apurado hoje. Não busque nada novo. Trabalhe apenas sobre ele.

${contexto}

Schema:
{"fio":"","apendice":{"fatos":[],"inferencias":[{"texto":"","confianca":"alta|media|baixa"}],"hipoteses":[],"lacunas":[]}}

- fio: um parágrafo único de 4 a 5 frases amarrando os itens numa leitura de conjuntura. Descritivo, sem dizer o que fazer com a informação.
- fatos: até 4 pontos verificados em fonte, uma linha cada.
- inferencias: até 3 derivações de raciocínio, uma linha cada, com grau de confiança.
- hipoteses: até 2 cenários possíveis, não confirmados, uma linha cada.
- lacunas: até 2 pontos que ficaram sem apuração, uma linha cada.

Responda APENAS com JSON válido.`;

/**
 * Reforço das tentativas seguintes.
 *
 * A primeira tentativa é a mais limpa: o prompt pede o que precisa e nada mais.
 * Quando ela falha, quase sempre é embalagem (texto em volta do JSON) ou
 * truncamento, e é isso que o reforço ataca — sem reescrever o pedido, que
 * mudaria o conteúdo apurado em vez de consertar o formato.
 */
const REFORCO =
  "\n\nATENÇÃO: a tentativa anterior não devolveu JSON aproveitável. " +
  "Devolva apenas o JSON, sem texto ao redor, e mantenha os campos curtos para não truncar.";

export type EntradaDoPrompt = {
  readonly hoje: string;
  /** Só para o bloco `topico`. */
  readonly assunto?: { readonly titulo: string; readonly resumo: string };
  /** Só para o bloco `fio`: o material já apurado, serializado. */
  readonly contexto?: string;
  /** 0 na primeira tentativa. A partir de 1, entra o reforço de formato. */
  readonly tentativa: number;
};

export function promptDoBloco(bloco: BlocoApi, entrada: EntradaDoPrompt): string {
  const { hoje, assunto, contexto, tentativa } = entrada;

  const corpo = (() => {
    switch (bloco) {
      case "painel":
        return painel(hoje);
      case "pauta":
        return pauta(hoje);
      case "topico":
        return topico(hoje, assunto ?? { titulo: "", resumo: "" });
      case "publica":
        return publica(hoje);
      case "internacional":
        return internacional(hoje);
      case "regional":
        return regional(hoje);
      case "fio":
        return fio(hoje, contexto ?? "");
    }
  })();

  return tentativa > 0 ? corpo + REFORCO : corpo;
}
