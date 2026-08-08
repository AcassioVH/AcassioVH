/**
 * Os tipos de instituição que aparecem no caminho do seu dinheiro.
 *
 * O site já respondia "para onde vai o seu dinheiro". Faltava a outra metade da
 * mesma pergunta: **quem é essa gente**. O visitante lê "emitido por uma
 * instituição financeira autorizada pelo Banco Central" em dez fichas
 * diferentes sem que nada explique o que isso significa — e é justamente aí que
 * mora a diferença entre ter FGC e não ter, entre emprestar a um banco e
 * emprestar a uma empresa, entre quem emite o papel e quem só vende o papel.
 *
 * **Tipos, nunca instituições nomeadas.** Esta página descreve categorias
 * jurídicas: o que cada tipo pode emitir, quem o autoriza, qual garantia se
 * aplica. Ela não descreve, compara nem qualifica o Banco X ou a Corretora Y.
 * A restrição é deliberada e é de conformidade: falar de uma instituição
 * específica é análise de emissor, que exige registro que este site não tem e
 * não pretende exercer. Para olhar uma instituição concreta, o visitante recebe
 * o endereço da fonte oficial — FGC, Banco Central, CVM, SUSEP — e consulta por
 * conta própria, na fonte que a supervisiona.
 *
 * Como todo o resto do catálogo: descreve estrutura, não emite juízo. Nenhum
 * tipo de instituição é apresentado como preferível a outro.
 */

import type { AssetClass } from "../assets/taxonomy";
import type { OfficialSource } from "../assets/profile-types";

/** Quem autoriza o funcionamento e supervisiona. */
export type Supervisor = "Banco Central" | "CVM" | "SUSEP" | "Banco Central e CVM";

export type InstitutionKind = {
  readonly id: string;
  /** O nome do tipo, como aparece na norma. Ex.: "Banco de investimento". */
  readonly label: string;
  /**
   * O nome curto, para menu e migalha.
   *
   * O rótulo da norma é longo de propósito — "Sociedade de crédito,
   * financiamento e investimento" não cabe num item de menu, e cortá-lo na
   * renderização produziria reticências no meio de uma palavra.
   */
  readonly short: string;
  /** O apelido pelo qual o mercado chama, quando existe. Ex.: "a financeira". */
  readonly alias: string | null;
  /** O que faz, em uma linha. */
  readonly role: string;
  /** Explicação didática do papel no mercado. Estrutura, nunca mérito. */
  readonly whatItIs: string;
  readonly supervisor: Supervisor;
  /**
   * Produtos deste catálogo que o tipo pode emitir.
   *
   * A lista é limitada ao que o site cataloga — não é a relação exaustiva de
   * tudo que a norma autoriza. Vira link para a ficha de cada produto, que é o
   * ponto: o visitante sai daqui sabendo onde ler o resto.
   */
  readonly issues: readonly AssetClass[];
  /** Para os tipos que não emitem nada: o que fazem no lugar disso. */
  readonly issuesNote: string | null;
  /** Rótulo curto da garantia, para o cartão. Ex.: "FGC". */
  readonly guaranteeTag: string;
  /** A garantia por extenso, com o que ela não cobre. */
  readonly guarantee: string;
};

/**
 * Os tipos, agrupados pela função que exercem no caminho do dinheiro.
 *
 * O agrupamento por função — e não por supervisor — é o que ensina: "quem pode
 * receber o seu dinheiro em depósito" é uma pergunta que o visitante tem;
 * "quem é supervisionado pelo Banco Central" não é. O supervisor aparece em
 * cada cartão, porque é ele que o visitante vai consultar depois.
 */
export type InstitutionGroup = {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly accent: string;
  readonly kindIds: readonly string[];
};

export const INSTITUTION_KINDS: readonly InstitutionKind[] = [
  {
    id: "banco-comercial",
    label: "Banco comercial",
    short: "Banco comercial",
    alias: null,
    role: "Recebe depósitos do público e concede crédito.",
    whatItIs:
      "É a instituição que mantém conta corrente — o depósito à vista — e capta também a " +
      "prazo, usando esse dinheiro para emprestar a pessoas e empresas. Quando você aplica " +
      "num CDB, está emprestando ao banco; o banco empresta adiante. A diferença entre o que " +
      "ele paga a você e o que cobra de quem toma emprestado é a receita da atividade.",
    supervisor: "Banco Central",
    issues: ["CDB", "RDB", "LCI", "LCA", "LF", "LIG", "DPGE", "POUPANCA"],
    issuesNote: null,
    guaranteeTag: "FGC",
    guarantee:
      "Depósitos e títulos cobertos entram no Fundo Garantidor de Créditos, dentro dos " +
      "limites vigentes por CPF e por instituição. A cobertura é do título, não do banco: " +
      "a Letra Financeira, por exemplo, fica de fora dela.",
  },
  {
    id: "banco-multiplo",
    label: "Banco múltiplo",
    short: "Banco múltiplo",
    alias: null,
    role: "Uma instituição só, com várias carteiras.",
    whatItIs:
      "Reúne numa mesma instituição duas ou mais carteiras — comercial, de investimento, de " +
      "crédito imobiliário, de arrendamento mercantil, de desenvolvimento. É o formato da " +
      "maior parte dos grandes bancos brasileiros: aquilo que você chama de 'meu banco' " +
      "costuma ser um banco múltiplo, e o que ele pode emitir depende das carteiras que " +
      "tem autorizadas.",
    supervisor: "Banco Central",
    issues: ["CDB", "RDB", "LCI", "LCA", "LF", "LIG", "DPGE", "POUPANCA", "COE"],
    issuesNote: null,
    guaranteeTag: "FGC",
    guarantee:
      "Depende do título, não do porte do banco. CDB, RDB, LCI, LCA, DPGE e poupança são " +
      "cobertos pelo FGC nos limites vigentes; Letra Financeira e COE não são.",
  },
  {
    id: "banco-investimento",
    label: "Banco de investimento",
    short: "Banco de investimento",
    alias: null,
    role: "Crédito de prazo longo e estruturação de operações.",
    whatItIs:
      "Não abre conta corrente e não capta depósito à vista. Trabalha com crédito de médio e " +
      "longo prazo, estruturação de operações e distribuição no mercado de títulos emitidos " +
      "por outras empresas. É quem monta a emissão de debêntures de uma companhia e a leva " +
      "aos investidores.",
    supervisor: "Banco Central",
    issues: ["CDB", "RDB", "LF", "COE"],
    issuesNote: null,
    guaranteeTag: "FGC parcial",
    guarantee:
      "CDB e RDB entram no FGC nos limites vigentes. Letra Financeira e COE não são cobertos " +
      "pelo fundo — quem responde por eles é o emissor.",
  },
  {
    id: "financeira",
    label: "Sociedade de crédito, financiamento e investimento",
    short: "Financeira",
    alias: "a financeira",
    role: "Crédito ao consumo: crediário, veículo, empréstimo pessoal.",
    whatItIs:
      "É a instituição do financiamento ao consumidor. Não tem conta corrente e não recebe " +
      "depósito à vista: capta emitindo títulos próprios e usa o dinheiro para bancar a " +
      "carteira de crédito. Muitas nascem ligadas ao varejo ou às montadoras, para financiar " +
      "a venda do próprio grupo.",
    supervisor: "Banco Central",
    issues: ["LC", "RDB", "LF"],
    issuesNote: null,
    guaranteeTag: "FGC parcial",
    guarantee:
      "Letra de Câmbio e RDB são cobertos pelo FGC nos limites vigentes. Letra Financeira " +
      "não é.",
  },
  {
    id: "cooperativa",
    label: "Cooperativa de crédito",
    short: "Cooperativa de crédito",
    alias: null,
    role: "Instituição financeira de propriedade dos próprios associados.",
    whatItIs:
      "Quem deposita numa cooperativa é dono dela, não cliente: a figura é o associado, e o " +
      "resultado do exercício é repartido entre eles. Capta dos associados e empresta a " +
      "eles. É instituição financeira autorizada pelo Banco Central, com regras próprias de " +
      "governança e de admissão.",
    supervisor: "Banco Central",
    issues: ["RDB", "LCA"],
    issuesNote: null,
    guaranteeTag: "FGCoop",
    guarantee:
      "Não é o FGC. Depósitos e RDB de cooperativa singular são cobertos pelo FGCoop — o " +
      "Fundo Garantidor do Cooperativismo de Crédito — que tem limites e regras próprios, " +
      "publicados no site dele.",
  },

  {
    id: "corretora",
    label: "Corretora e distribuidora de títulos e valores mobiliários",
    short: "Corretora e distribuidora",
    alias: "CTVM e DTVM",
    role: "É por onde você compra. Não é quem emite.",
    whatItIs:
      "Recebe a sua ordem e a leva ao mercado ou ao emissor, e mantém a sua conta de " +
      "investimento. O papel comprado fica registrado no seu nome na depositária central, e " +
      "não no balanço da corretora — por isso ela não é o destino do seu dinheiro, e sim o " +
      "caminho até ele. Corretora e distribuidora têm hoje praticamente as mesmas " +
      "atribuições; a distinção entre as duas é histórica.",
    supervisor: "Banco Central e CVM",
    issues: [],
    issuesNote:
      "Nenhum produto próprio: distribui o que outras instituições emitem. A ficha do que " +
      "você comprou continua sendo a do emissor — é ele quem deve o pagamento, e é o tipo " +
      "dele que define se há FGC.",
    guaranteeTag: "Fora do FGC",
    guarantee:
      "O FGC não cobre corretora, porque não há depósito nela para cobrir. Para operações em " +
      "bolsa existe o MRP, o mecanismo de ressarcimento de prejuízos da B3, restrito às " +
      "hipóteses e ao teto previstos no regulamento dele.",
  },
  {
    id: "depositaria",
    label: "Depositária central",
    short: "Depositária central",
    alias: null,
    role: "Guarda o registro de quem é dono de cada papel.",
    whatItIs:
      "É onde ações, títulos e cotas ficam registrados em nome do investidor final. No " +
      "Brasil essa função é exercida pela B3. É a razão de o seu ativo não desaparecer junto " +
      "com a corretora: o registro de titularidade está fora dela, e você pode conferir o " +
      "que consta no seu CPF sem pedir nada a ninguém.",
    supervisor: "Banco Central e CVM",
    issues: [],
    issuesNote:
      "Não emite e não deve nada a você. Apenas registra de quem é cada papel. Quem responde " +
      "pelo pagamento continua sendo o emissor.",
    guaranteeTag: "Não se aplica",
    guarantee:
      "Não há garantia a discutir porque não há dívida com você: a depositária não capta " +
      "dinheiro do investidor.",
  },

  {
    id: "securitizadora",
    label: "Companhia securitizadora",
    short: "Securitizadora",
    alias: null,
    role: "Transforma recebíveis em títulos negociáveis.",
    whatItIs:
      "Compra direitos a receber — parcelas de financiamento imobiliário, de crédito rural, " +
      "de vendas a prazo — e emite títulos lastreados neles. Não é banco: não capta " +
      "depósito e não concede crédito. O que ela faz é empacotar crédito de terceiros num " +
      "papel que pode ser vendido a investidores.",
    supervisor: "CVM",
    issues: ["CRI", "CRA"],
    issuesNote: null,
    guaranteeTag: "Fora do FGC",
    guarantee:
      "Não há cobertura do FGC. A proteção, quando existe, está na estrutura da própria " +
      "operação — regime fiduciário separando o patrimônio, coobrigação, garantias reais — e " +
      "está descrita no termo de securitização daquela emissão.",
  },
  {
    id: "gestora",
    label: "Gestora de recursos",
    short: "Gestora de recursos",
    alias: "asset",
    role: "Decide o que entra na carteira do fundo.",
    whatItIs:
      "É quem toma as decisões de compra e venda dentro do fundo, respeitando os limites " +
      "escritos no regulamento. Precisa de autorização própria da CVM para exercer a " +
      "atividade. Não fica com o dinheiro: o patrimônio do fundo é separado do patrimônio da " +
      "gestora e permanece em custódia.",
    supervisor: "CVM",
    issues: [],
    issuesNote:
      "Não emite título. Quem tem cotas é o fundo, que é um patrimônio com CNPJ próprio, e " +
      "não a gestora.",
    guaranteeTag: "Não se aplica",
    guarantee:
      "Fundo não tem FGC. O que existe é a segregação patrimonial: o dinheiro do fundo não " +
      "se confunde com o da gestora nem com o do administrador.",
  },
  {
    id: "administradora",
    label: "Administradora fiduciária",
    short: "Administradora fiduciária",
    alias: null,
    role: "Responde pelo fundo perante o cotista e o regulador.",
    whatItIs:
      "Constitui o fundo, contrata os prestadores de serviço, escritura as cotas, calcula o " +
      "valor delas e divulga os informes periódicos. É o nome que aparece junto ao CNPJ do " +
      "fundo, e é a quem o cotista se dirige formalmente. Gestora e administradora podem ser " +
      "empresas diferentes — e frequentemente são.",
    supervisor: "CVM",
    issues: [],
    issuesNote:
      "Não emite título próprio. Responde pelo funcionamento do fundo e pelas informações " +
      "que ele publica.",
    guaranteeTag: "Não se aplica",
    guarantee:
      "Fora do FGC, como todo fundo. A obrigação da administradora é de conduta e de " +
      "informação, verificável nos documentos que ela publica na CVM.",
  },

  {
    id: "seguradora",
    label: "Seguradora e entidade aberta de previdência complementar",
    short: "Seguradora e previdência",
    alias: "EAPC",
    role: "Opera os planos de previdência aberta.",
    whatItIs:
      "É a instituição que emite PGBL e VGBL. A estrutura é de seguro, não de fundo: você " +
      "contrata um plano com a seguradora, e os recursos vão para um fundo de investimento " +
      "especialmente constituído, vinculado àquele plano. Por isso a previdência tem regras " +
      "próprias de imposto e de sucessão, diferentes das de um fundo comum.",
    supervisor: "SUSEP",
    issues: ["PREVIDENCIA", "PGBL", "VGBL"],
    issuesNote: null,
    guaranteeTag: "Fora do FGC",
    guarantee:
      "Não há FGC nem supervisão da CVM. Quem autoriza, registra e fiscaliza é a SUSEP, com " +
      "exigências próprias de reservas e de solvência.",
  },
];

export const INSTITUTION_GROUPS: readonly InstitutionGroup[] = [
  {
    id: "captam",
    label: "Quem pode receber o seu dinheiro em depósito",
    summary:
      "São as instituições financeiras propriamente ditas: precisam de autorização do Banco " +
      "Central para funcionar, emitem título próprio e é no balanço delas que o seu dinheiro " +
      "entra. É também o único grupo em que a conversa sobre FGC faz sentido.",
    accent: "#E3BC7E",
    kindIds: [
      "banco-comercial",
      "banco-multiplo",
      "banco-investimento",
      "financeira",
      "cooperativa",
    ],
  },
  {
    id: "intermediam",
    label: "Quem leva a sua ordem e guarda o registro",
    summary:
      "Ficam entre você e o emissor. Não devem nada a você: o dinheiro atravessa e vai " +
      "para quem emitiu o papel. Entender isso é entender por que a pergunta sobre garantia " +
      "nunca é sobre a corretora.",
    accent: "#8FBCC2",
    kindIds: ["corretora", "depositaria"],
  },
  {
    id: "estruturam",
    label: "Quem estrutura e administra",
    summary:
      "Montam o produto ou cuidam dele depois de montado. Registradas na CVM, e não no " +
      "Banco Central, porque o que fazem é mercado de capitais e não intermediação de " +
      "crédito.",
    accent: "#C9954A",
    kindIds: ["securitizadora", "gestora", "administradora"],
  },
  {
    id: "previdencia",
    label: "Quem opera previdência",
    summary:
      "Um regulador só para elas. A previdência aberta não passa pela CVM nem pelo FGC: " +
      "vive sob a SUSEP, com regras próprias.",
    accent: "#6C8E96",
    kindIds: ["seguradora"],
  },
];

/**
 * Onde conferir uma instituição específica.
 *
 * O contraponto necessário à decisão de não descrever instituição nenhuma pelo
 * nome: em vez de uma opinião nossa sobre o Banco X, o endereço exato do órgão
 * que o autoriza e dos dados que ele publica. É a mesma lógica das fontes
 * oficiais em cada verbete — o site ensina a ler, a fonte informa o dado.
 */
export const WHERE_TO_CHECK: readonly OfficialSource[] = [
  {
    label: "FGC",
    url: "https://www.fgc.org.br",
    whatYouFindThere:
      "a relação de instituições associadas e os limites vigentes da cobertura, por CPF e " +
      "por instituição",
  },
  {
    label: "FGCoop",
    url: "https://www.fgcoop.coop.br",
    whatYouFindThere: "as cooperativas cobertas e as regras próprias desse fundo garantidor",
  },
  {
    label: "Banco Central",
    url: "https://www.bcb.gov.br",
    whatYouFindThere:
      "se a instituição é autorizada a funcionar, sob qual tipo, e o histórico de " +
      "reclamações registradas contra ela",
  },
  {
    label: "Banco Central — IF.data",
    url: "https://www3.bcb.gov.br/ifdata/",
    whatYouFindThere:
      "balanço, porte e indicadores de cada instituição autorizada, trimestre a trimestre",
  },
  {
    label: "CVM",
    url: "https://www.gov.br/cvm/pt-br",
    whatYouFindThere:
      "o registro dos participantes do mercado de capitais: corretoras, gestoras, " +
      "administradoras e securitizadoras",
  },
  {
    label: "SUSEP",
    url: "https://www.gov.br/susep/pt-br",
    whatYouFindThere: "o registro da seguradora e do plano de previdência contratado",
  },
  {
    label: "B3 — Área do Investidor",
    url: "https://www.b3.com.br",
    whatYouFindThere: "o que está registrado no seu CPF na depositária central",
  },
];

/**
 * Nem todo emissor é instituição financeira.
 *
 * A observação fecha a página porque desfaz a confusão mais comum de quem
 * acabou de ler o resto: a de que tudo que se compra numa corretora foi emitido
 * por um banco.
 */
export const NOT_A_FINANCIAL_INSTITUTION =
  "Ação, debênture e nota comercial não são emitidas por instituição financeira. Quem as " +
  "emite é uma companhia aberta — uma empresa comum, registrada na CVM para captar no " +
  "mercado, sem autorização do Banco Central e sem FGC. É exatamente a diferença entre " +
  "emprestar a um banco e emprestar direto a uma empresa.";

export function institutionKindById(id: string): InstitutionKind | null {
  return INSTITUTION_KINDS.find((kind) => kind.id === id) ?? null;
}

export function kindsOf(group: InstitutionGroup): InstitutionKind[] {
  return group.kindIds
    .map(institutionKindById)
    .filter((kind): kind is InstitutionKind => kind !== null);
}
