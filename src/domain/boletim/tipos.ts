/**
 * Formato do boletim de conjuntura.
 *
 * Estes tipos descrevem *notícia econômica*, e não produto de investimento —
 * é por isso que eles vivem num módulo próprio e não encostam em
 * `AssetProfile`. A ficha de produto não tem campo de rentabilidade nem de
 * juízo por decisão de arquitetura (ver `docs/COMPLIANCE.md`), e um boletim que
 * cita "Selic a 15%" com fonte não é a mesma coisa que o site afirmar quanto
 * um produto rende.
 *
 * A diferença que sustenta essa separação: aqui todo número é **atribuído** —
 * veículo e data obrigatórios, com URL quando a busca devolveu uma. O boletim
 * relata o que a imprensa e os órgãos oficiais publicaram; ele não afirma por
 * conta própria.
 *
 * O texto que preenche estes campos é gerado por modelo de linguagem, ou seja,
 * é texto de terceiro. Ele passa pela peneira de `conformidade.ts` antes de
 * chegar à tela — nenhum campo aqui é exibido sem essa passagem.
 */

/** Atribuição de um fato: quem publicou, quando, e onde conferir. */
export type Fonte = {
  readonly veiculo: string;
  readonly data: string;
  /** Só http(s). Ver `normalizar.ts` — URL de esquema estranho é descartada. */
  readonly url?: string;
};

/** Direção do movimento de um indicador. Descreve sentido, nunca mérito. */
export type Direcao = "alta" | "baixa" | "estavel";

export type Indicador = {
  readonly nome: string;
  readonly valor: string;
  readonly variacao: string;
  readonly direcao: Direcao;
  readonly fonte: string;
  readonly data: string;
};

export type Painel = {
  readonly indicadores: readonly Indicador[];
};

/** Assunto levantado na pauta, antes do aprofundamento. */
export type Assunto = {
  readonly titulo: string;
  readonly resumo: string;
};

export type Pauta = {
  readonly topicos: readonly Assunto[];
};

/** Quanta confiança a apuração merece. Cor mais palavra, sempre. */
export type Confianca = "alta" | "media" | "baixa";

export type Topico = {
  readonly titulo: string;
  readonly fato: string;
  readonly fontes: readonly Fonte[];
  readonly leitura_brasil: string;
  readonly leitura_investidor: string;
  readonly vetor_internacional: string;
  readonly corte_regional: string;
  readonly confianca: Confianca | null;
};

/** Anúncio, tramitação e vigência são coisas diferentes, e o campo exige a distinção. */
export type Estagio = "anunciado" | "em tramitação" | "em vigor";

export type ItemPublico = {
  readonly titulo: string;
  readonly fato: string;
  readonly estagio: Estagio | null;
  readonly impacto: string;
  readonly fontes: readonly Fonte[];
};

export type DecisaoPublica = {
  readonly itens: readonly ItemPublico[];
};

export type ItemInternacional = {
  readonly titulo: string;
  readonly fato: string;
  readonly canal_transmissao: string;
  readonly efeito_brasil: string;
  readonly fontes: readonly Fonte[];
};

export type Internacional = {
  readonly itens: readonly ItemInternacional[];
};

export type ItemRegional = {
  readonly titulo: string;
  readonly fato: string;
  readonly impacto: string;
  readonly fontes: readonly Fonte[];
};

export type Regional = {
  readonly itens: readonly ItemRegional[];
  /** Preenchida quando não houve movimento — a ausência também é informação. */
  readonly nota: string;
};

export type Inferencia = {
  readonly texto: string;
  readonly confianca: Confianca | null;
};

/**
 * O apêndice é o mecanismo de honestidade do boletim.
 *
 * Separar fato de inferência, de hipótese, de lacuna é o que impede que uma
 * leitura de conjuntura passe por apuração. O que foi verificado em fonte vive
 * numa lista; o que é raciocínio vive noutra, com grau de confiança declarado.
 */
export type Apendice = {
  readonly fatos: readonly string[];
  readonly inferencias: readonly Inferencia[];
  readonly hipoteses: readonly string[];
  readonly lacunas: readonly string[];
};

export type Fio = {
  readonly fio: string;
  readonly apendice: Apendice;
};

/** Mapa de bloco → formato devolvido, usado para tipar a resposta da rota. */
export type ConteudoPorBloco = {
  readonly painel: Painel;
  readonly pauta: Pauta;
  readonly topico: Topico;
  readonly publica: DecisaoPublica;
  readonly internacional: Internacional;
  readonly regional: Regional;
  readonly fio: Fio;
};
