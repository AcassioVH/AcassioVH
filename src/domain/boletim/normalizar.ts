/**
 * Da resposta do modelo para o tipo do domínio.
 *
 * A saída de um modelo de linguagem é `unknown`, e tratá-la como qualquer outra
 * coisa é confiar num terceiro que não tem contrato. Um campo pode vir null,
 * vir número onde o schema pedia texto, vir uma lista de sete itens onde o
 * prompt pediu dois, ou vir com uma URL `javascript:` que o React renderizaria
 * como link clicável.
 *
 * A regra aqui é sempre a mesma: **degrade, não exploda.** Campo ausente vira
 * string vazia, item malformado é descartado, lista longa demais é cortada no
 * limite que o prompt pediu. Um bloco meio apurado ainda serve; uma exceção no
 * meio da renderização derruba o boletim inteiro.
 *
 * Os limites de contagem são repetidos aqui de propósito, e não confiados ao
 * prompt: prompt é pedido, código é garantia.
 */

import type {
  Apendice,
  Assunto,
  Confianca,
  DecisaoPublica,
  Direcao,
  Estagio,
  Fio,
  Fonte,
  Indicador,
  Inferencia,
  Internacional,
  ItemInternacional,
  ItemPublico,
  ItemRegional,
  Painel,
  Pauta,
  Regional,
  Topico,
} from "./tipos";

/** Teto por campo. Um modelo em loop não deve conseguir despejar um romance na tela. */
const MAX_TEXTO = 1200;

function objeto(valor: unknown): Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

function lista(valor: unknown): readonly unknown[] {
  return Array.isArray(valor) ? valor : [];
}

/** Texto normalizado: sem espaço sobrando, sem controle, com teto de tamanho. */
function texto(valor: unknown): string {
  if (typeof valor === "number" && Number.isFinite(valor)) return String(valor);
  if (typeof valor !== "string") return "";
  return valor.replace(/\s+/g, " ").trim().slice(0, MAX_TEXTO);
}

/** Lista de strings, sem os vazios. */
function textos(valor: unknown, limite: number): readonly string[] {
  return lista(valor)
    .map(texto)
    .filter((item) => item.length > 0)
    .slice(0, limite);
}

function umDentre<T extends string>(valor: unknown, aceitos: readonly T[]): T | null {
  const bruto = texto(valor).toLowerCase();
  return aceitos.find((aceito) => aceito === bruto) ?? null;
}

const DIRECOES: readonly Direcao[] = ["alta", "baixa", "estavel"];
const CONFIANCAS: readonly Confianca[] = ["alta", "media", "baixa"];
const ESTAGIOS: readonly Estagio[] = ["anunciado", "em tramitação", "em vigor"];

/**
 * URL de fonte, ou nada.
 *
 * O boletim renderiza fontes como âncoras clicáveis, e a URL vem de texto
 * gerado. `javascript:` num href é XSS, e o React não protege contra isso em
 * `<a href>` — a checagem de esquema é obrigatória, não zelo excessivo.
 */
function urlDeFonte(valor: unknown): string | undefined {
  const bruto = texto(valor);
  if (bruto.length === 0) return undefined;

  try {
    const analisada = new URL(bruto);
    if (analisada.protocol !== "https:" && analisada.protocol !== "http:") return undefined;
    return analisada.toString();
  } catch {
    return undefined;
  }
}

/** Fontes de um item. Sem veículo não é fonte: some. */
function fontes(valor: unknown, limite: number): readonly Fonte[] {
  return lista(valor)
    .map((bruto): Fonte => {
      const campo = objeto(bruto);
      const url = urlDeFonte(campo.url);
      return {
        veiculo: texto(campo.veiculo),
        data: texto(campo.data),
        ...(url ? { url } : {}),
      };
    })
    .filter((fonte) => fonte.veiculo.length > 0)
    .slice(0, limite);
}

export function normalizarPainel(bruto: unknown): Painel {
  const indicadores = lista(objeto(bruto).indicadores)
    .map((item): Indicador => {
      const campo = objeto(item);
      return {
        nome: texto(campo.nome),
        valor: texto(campo.valor),
        variacao: texto(campo.variacao),
        direcao: umDentre(campo.direcao, DIRECOES) ?? "estavel",
        fonte: texto(campo.fonte),
        data: texto(campo.data),
      };
    })
    .filter((indicador) => indicador.nome.length > 0 && indicador.valor.length > 0)
    .slice(0, 5);

  return { indicadores };
}

export function normalizarPauta(bruto: unknown): Pauta {
  const topicos = lista(objeto(bruto).topicos)
    .map((item): Assunto => {
      const campo = objeto(item);
      return { titulo: texto(campo.titulo), resumo: texto(campo.resumo) };
    })
    .filter((assunto) => assunto.titulo.length > 0)
    .slice(0, 3);

  return { topicos };
}

export function normalizarTopico(bruto: unknown): Topico {
  const campo = objeto(bruto);
  return {
    titulo: texto(campo.titulo),
    fato: texto(campo.fato),
    fontes: fontes(campo.fontes, 4),
    leitura_brasil: texto(campo.leitura_brasil),
    leitura_investidor: texto(campo.leitura_investidor),
    vetor_internacional: texto(campo.vetor_internacional),
    corte_regional: texto(campo.corte_regional),
    confianca: umDentre(campo.confianca, CONFIANCAS),
  };
}

export function normalizarPublica(bruto: unknown): DecisaoPublica {
  const itens = lista(objeto(bruto).itens)
    .map((item): ItemPublico => {
      const campo = objeto(item);
      return {
        titulo: texto(campo.titulo),
        fato: texto(campo.fato),
        estagio: umDentre(campo.estagio, ESTAGIOS),
        impacto: texto(campo.impacto),
        fontes: fontes(campo.fontes, 2),
      };
    })
    .filter((item) => item.titulo.length > 0)
    .slice(0, 2);

  return { itens };
}

export function normalizarInternacional(bruto: unknown): Internacional {
  const itens = lista(objeto(bruto).itens)
    .map((item): ItemInternacional => {
      const campo = objeto(item);
      return {
        titulo: texto(campo.titulo),
        fato: texto(campo.fato),
        canal_transmissao: texto(campo.canal_transmissao),
        efeito_brasil: texto(campo.efeito_brasil),
        fontes: fontes(campo.fontes, 2),
      };
    })
    .filter((item) => item.titulo.length > 0)
    .slice(0, 2);

  return { itens };
}

export function normalizarRegional(bruto: unknown): Regional {
  const campo = objeto(bruto);
  const itens = lista(campo.itens)
    .map((item): ItemRegional => {
      const dados = objeto(item);
      return {
        titulo: texto(dados.titulo),
        fato: texto(dados.fato),
        impacto: texto(dados.impacto),
        fontes: fontes(dados.fontes, 2),
      };
    })
    .filter((item) => item.titulo.length > 0)
    .slice(0, 2);

  return { itens, nota: texto(campo.nota) };
}

function normalizarApendice(bruto: unknown): Apendice {
  const campo = objeto(bruto);
  const inferencias = lista(campo.inferencias)
    .map((item): Inferencia => {
      const dados = objeto(item);
      return {
        texto: texto(dados.texto),
        confianca: umDentre(dados.confianca, CONFIANCAS),
      };
    })
    .filter((item) => item.texto.length > 0)
    .slice(0, 3);

  return {
    fatos: textos(campo.fatos, 4),
    inferencias,
    hipoteses: textos(campo.hipoteses, 2),
    lacunas: textos(campo.lacunas, 2),
  };
}

export function normalizarFio(bruto: unknown): Fio {
  const campo = objeto(bruto);
  return {
    fio: texto(campo.fio),
    apendice: normalizarApendice(campo.apendice),
  };
}
