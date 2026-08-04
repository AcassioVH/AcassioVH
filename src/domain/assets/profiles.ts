/**
 * Catálogo de fichas educativas, curado por tipo de ativo.
 *
 * Todo texto exibido ao usuário sobre um ativo sai daqui. Não há geração
 * dinâmica de conteúdo descritivo em nenhum ponto do sistema: se está na tela,
 * passou por curadoria humana e pelo teste de conformidade.
 *
 * As fichas descrevem o *tipo* de ativo, nunca o ativo específico da carteira
 * do usuário. "Como funciona um CDB" é conteúdo educativo; "como está o CDB do
 * Banco X" seria análise.
 */

import type { AssetProfile } from "./profile-types";
import type { AssetClass } from "./taxonomy";

/**
 * Regras tributárias mudam por lei e por medida provisória. O sistema descreve
 * a regra geral vigente conhecida na curadoria, e sempre remete à fonte
 * oficial — assim como faz com rentabilidade.
 */
export const TAX_NOTICE =
  "Regras tributárias mudam com frequência. Confirme sempre na Receita Federal " +
  "ou com seu contador antes de considerar qualquer valor.";

/** Data da última revisão editorial do catálogo. Exibida nas fichas. */
export const CATALOG_REVIEWED_AT = "2026-08-04";

const SOURCE_STATUS_INVEST = {
  label: "Status Invest",
  url: "https://statusinvest.com.br",
  whatYouFindThere: "cotações, histórico e indicadores atualizados do ativo",
} as const;

const SOURCE_B3 = {
  label: "B3",
  url: "https://www.b3.com.br",
  whatYouFindThere: "dados oficiais de negociação e registro do ativo",
} as const;

const SOURCE_FGC = {
  label: "FGC",
  url: "https://www.fgc.org.br",
  whatYouFindThere: "regras e limites vigentes da cobertura do Fundo Garantidor de Créditos",
} as const;

const SOURCE_RECEITA = {
  label: "Receita Federal",
  url: "https://www.gov.br/receitafederal/pt-br",
  whatYouFindThere: "regras tributárias vigentes aplicáveis ao instrumento",
} as const;

const SOURCE_CVM_FUNDOS = {
  label: "CVM — Consulta de Fundos",
  url: "https://cvmweb.cvm.gov.br/SWB/Sistemas/SCW/CPublica/CPublicaFdo.aspx",
  whatYouFindThere: "registro oficial, regulamento e informes periódicos do fundo pelo CNPJ",
} as const;

const SOURCE_TESOURO = {
  label: "Tesouro Direto",
  url: "https://www.tesourodireto.com.br",
  whatYouFindThere: "taxas, preços e vencimentos oficiais dos títulos públicos",
} as const;

const SOURCE_DEBENTURES = {
  label: "ANBIMA — Debêntures",
  url: "https://www.debentures.com.br",
  whatYouFindThere: "escritura, características e negociação do papel",
} as const;

const SOURCE_SUSEP = {
  label: "SUSEP",
  url: "https://www.gov.br/susep/pt-br",
  whatYouFindThere: "registro do plano e da seguradora responsável",
} as const;

const FGC_GUARANTEE = {
  kind: "FGC",
  description:
    "Coberto pelo Fundo Garantidor de Créditos dentro dos limites vigentes por CPF e " +
    "por instituição financeira, com teto global a cada período. A cobertura é do FGC, " +
    "uma entidade privada mantida pelas próprias instituições, e não do governo.",
} as const;

const NO_SPECIFIC_GUARANTEE = {
  kind: "SEM_GARANTIA_ESPECIFICA",
  description:
    "Não conta com cobertura do FGC. O pagamento depende integralmente da capacidade " +
    "financeira do emissor e da estrutura do próprio papel.",
} as const;

const PROFILE_LIST: readonly AssetProfile[] = [
  {
    assetClass: "CDB",
    label: "CDB",
    fullName: "Certificado de Depósito Bancário",
    summary: "Título de dívida emitido por um banco para captar recursos.",
    whatItIs:
      "Ao contratar um CDB, você empresta dinheiro a um banco por um prazo combinado. " +
      "Em troca, o banco devolve o valor com a remuneração pactuada no momento da " +
      "aplicação, que pode ser pós-fixada (geralmente atrelada ao CDI), prefixada ou " +
      "híbrida (índice de inflação mais uma taxa fixa).",
    issuedBy: "Bancos comerciais, múltiplos, de investimento e de desenvolvimento.",
    liquidity:
      "Varia conforme o contrato. Há CDBs com liquidez diária, que permitem resgate a " +
      "qualquer momento, e CDBs com carência até o vencimento. Quando não há liquidez " +
      "diária, a saída antecipada depende de o emissor ou o mercado secundário " +
      "recomprarem o papel, em condições que podem diferir das contratadas.",
    taxation:
      "Imposto de Renda retido na fonte sobre o rendimento, em alíquota regressiva pelo " +
      "prazo da aplicação: 22,5% até 180 dias, 20% de 181 a 360, 17,5% de 361 a 720 e " +
      "15% acima de 720 dias. Resgates nos primeiros 30 dias também sofrem IOF regressivo.",
    guarantee: FGC_GUARANTEE,
    characteristics: [
      "O prazo de vencimento é definido no momento da contratação.",
      "A remuneração é conhecida em sua fórmula, não em seu valor final, quando pós-fixada.",
      "O emissor é uma instituição financeira específica, o que concentra a exposição nela.",
    ],
    officialSources: [SOURCE_FGC, SOURCE_RECEITA, SOURCE_B3],
  },
  {
    assetClass: "LCI",
    label: "LCI",
    fullName: "Letra de Crédito Imobiliário",
    summary: "Título bancário lastreado em créditos do setor imobiliário.",
    whatItIs:
      "A LCI é emitida por instituições financeiras e tem como lastro uma carteira de " +
      "financiamentos imobiliários. O recurso captado é direcionado a esse setor, o que " +
      "explica o tratamento tributário diferenciado dado pela legislação.",
    issuedBy: "Bancos e instituições autorizadas a conceder crédito imobiliário.",
    liquidity:
      "A legislação estabelece prazo mínimo de carência para resgate, contado da emissão. " +
      "Antes disso não há resgate junto ao emissor; a saída, quando possível, ocorre no " +
      "mercado secundário.",
    taxation:
      "Rendimentos isentos de Imposto de Renda para pessoa física, conforme a legislação " +
      "vigente aplicável ao instrumento.",
    guarantee: FGC_GUARANTEE,
    characteristics: [
      "Possui carência mínima definida em norma, o que limita o resgate antecipado.",
      "O lastro imobiliário é uma exigência regulatória do instrumento.",
      "A isenção de IR para pessoa física decorre de lei e pode ser alterada por lei.",
    ],
    officialSources: [SOURCE_FGC, SOURCE_RECEITA, SOURCE_B3],
  },
  {
    assetClass: "LCA",
    label: "LCA",
    fullName: "Letra de Crédito do Agronegócio",
    summary: "Título bancário lastreado em créditos do agronegócio.",
    whatItIs:
      "Mesma estrutura da LCI, mudando o lastro: os recursos captados são direcionados a " +
      "operações de crédito do agronegócio. Também emitida por instituições financeiras, " +
      "com prazo e remuneração definidos na contratação.",
    issuedBy: "Bancos e instituições autorizadas a operar com crédito do agronegócio.",
    liquidity:
      "Há prazo mínimo de carência definido em norma. Durante a carência não há resgate " +
      "junto ao emissor.",
    taxation:
      "Rendimentos isentos de Imposto de Renda para pessoa física, conforme a legislação " +
      "vigente aplicável ao instrumento.",
    guarantee: FGC_GUARANTEE,
    characteristics: [
      "Possui carência mínima definida em norma.",
      "O lastro em crédito do agronegócio é exigência regulatória do instrumento.",
      "A isenção de IR para pessoa física decorre de lei e pode ser alterada por lei.",
    ],
    officialSources: [SOURCE_FGC, SOURCE_RECEITA, SOURCE_B3],
  },
  {
    assetClass: "LC",
    label: "LC",
    fullName: "Letra de Câmbio",
    summary: "Título de dívida emitido por financeiras para captar recursos.",
    whatItIs:
      "Apesar do nome, a Letra de Câmbio não tem relação com moeda estrangeira. É um " +
      "título de crédito emitido por sociedades de crédito, financiamento e investimento " +
      "— as financeiras — para captar recursos que financiam suas operações de crédito.",
    issuedBy: "Sociedades de crédito, financiamento e investimento (financeiras).",
    liquidity:
      "Em geral mantida até o vencimento, com carência contratual. A saída antecipada " +
      "depende de recompra pelo emissor ou de negociação no mercado secundário.",
    taxation:
      "Imposto de Renda na fonte em alíquota regressiva pelo prazo: 22,5% até 180 dias, " +
      "20% de 181 a 360, 17,5% de 361 a 720 e 15% acima de 720 dias. IOF regressivo nos " +
      "primeiros 30 dias.",
    guarantee: FGC_GUARANTEE,
    characteristics: [
      "O emissor é uma financeira, categoria distinta de banco comercial.",
      "O prazo costuma ser definido no ato da contratação, com carência.",
    ],
    officialSources: [SOURCE_FGC, SOURCE_RECEITA],
  },
  {
    assetClass: "CRI",
    label: "CRI",
    fullName: "Certificado de Recebíveis Imobiliários",
    summary: "Título de securitização lastreado em recebíveis imobiliários.",
    whatItIs:
      "O CRI transforma fluxos futuros de pagamento do setor imobiliário — aluguéis, " +
      "parcelas de financiamento — em um título negociável. Quem emite é uma companhia " +
      "securitizadora, que estrutura a operação; o pagamento depende dos devedores " +
      "originais desses recebíveis e das garantias montadas na estrutura.",
    issuedBy: "Companhias securitizadoras registradas na CVM.",
    liquidity:
      "Negociado no mercado secundário, onde o volume costuma ser reduzido e variável. " +
      "Não há resgate antecipado junto ao emissor.",
    taxation:
      "Rendimentos isentos de Imposto de Renda para pessoa física, conforme a legislação " +
      "vigente aplicável ao instrumento.",
    guarantee: {
      kind: "GARANTIA_REAL",
      description:
        "Não conta com cobertura do FGC. A operação costuma contar com garantias próprias " +
        "descritas no termo de securitização, como alienação fiduciária do imóvel e fundos " +
        "de reserva. A estrutura de garantia varia caso a caso e consta na documentação da emissão.",
    },
    characteristics: [
      "O pagamento depende do desempenho da carteira de recebíveis, não de um banco.",
      "Cada emissão tem estrutura de garantia própria, descrita no termo de securitização.",
      "O prazo costuma ser longo e o mercado secundário, pouco líquido.",
    ],
    officialSources: [SOURCE_B3, SOURCE_RECEITA, SOURCE_CVM_FUNDOS],
  },
  {
    assetClass: "CRA",
    label: "CRA",
    fullName: "Certificado de Recebíveis do Agronegócio",
    summary: "Título de securitização lastreado em recebíveis do agronegócio.",
    whatItIs:
      "Mesma lógica do CRI, com lastro em recebíveis do agronegócio: pagamentos devidos " +
      "por produtores, cooperativas ou empresas do setor. A securitizadora estrutura e " +
      "emite o papel, e o pagamento depende desses devedores e das garantias da operação.",
    issuedBy: "Companhias securitizadoras registradas na CVM.",
    liquidity:
      "Negociado no mercado secundário, com volume geralmente reduzido. Não há resgate " +
      "antecipado junto ao emissor.",
    taxation:
      "Rendimentos isentos de Imposto de Renda para pessoa física, conforme a legislação " +
      "vigente aplicável ao instrumento.",
    guarantee: {
      kind: "GARANTIA_REAL",
      description:
        "Não conta com cobertura do FGC. As garantias são próprias de cada emissão e " +
        "constam no termo de securitização, podendo incluir penhor, alienação fiduciária " +
        "e fundos de reserva.",
    },
    characteristics: [
      "O pagamento depende da carteira de recebíveis do agronegócio que lastreia a emissão.",
      "A estrutura de garantia varia por emissão e consta na documentação.",
      "Exposição setorial concentrada no agronegócio.",
    ],
    officialSources: [SOURCE_B3, SOURCE_RECEITA, SOURCE_CVM_FUNDOS],
  },
  {
    assetClass: "DEBENTURE",
    label: "Debênture",
    fullName: "Debênture",
    summary: "Título de dívida emitido por uma empresa não financeira.",
    whatItIs:
      "A debênture é um empréstimo feito diretamente a uma empresa. As condições — prazo, " +
      "remuneração, garantias, eventos de vencimento antecipado — estão na escritura de " +
      "emissão, o documento que rege o papel. Debêntures incentivadas são as que financiam " +
      "projetos de infraestrutura e recebem tratamento tributário próprio previsto em lei.",
    issuedBy: "Sociedades por ações não financeiras.",
    liquidity:
      "Negociada no mercado secundário, com liquidez que varia bastante entre emissões. " +
      "Algumas escrituras preveem recompra pelo emissor em datas específicas.",
    taxation:
      "Debêntures comuns seguem a tabela regressiva de IR (22,5% a 15% conforme o prazo). " +
      "Debêntures incentivadas de infraestrutura têm rendimentos isentos de IR para pessoa " +
      "física, conforme a legislação específica aplicável.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "O pagamento depende da situação financeira da empresa emissora.",
      "As condições completas estão na escritura de emissão, documento público.",
      "Pode ter garantia real, flutuante, quirografária ou subordinada — cada uma com posição diferente na ordem de recebimento.",
    ],
    officialSources: [SOURCE_DEBENTURES, SOURCE_B3, SOURCE_RECEITA],
  },
  {
    assetClass: "TESOURO_DIRETO",
    label: "Tesouro Direto",
    fullName: "Títulos Públicos Federais — Tesouro Direto",
    summary: "Títulos de dívida emitidos pelo Tesouro Nacional.",
    whatItIs:
      "São títulos da dívida pública federal vendidos a pessoas físicas pela plataforma do " +
      "Tesouro Direto. As principais famílias são o Tesouro Selic (pós-fixado, acompanha a " +
      "taxa básica), o Tesouro Prefixado (taxa definida na compra) e o Tesouro IPCA+ " +
      "(inflação medida pelo IPCA mais uma taxa fixa).",
    issuedBy: "Tesouro Nacional.",
    liquidity:
      "O Tesouro Nacional garante recompra diária dos títulos, em dias úteis, pelo preço de " +
      "mercado do momento. Isso significa que a saída antes do vencimento ocorre a preço " +
      "corrente, que oscila conforme as taxas de juros — mecanismo conhecido como marcação " +
      "a mercado.",
    taxation:
      "Imposto de Renda na fonte em alíquota regressiva pelo prazo: 22,5% até 180 dias, " +
      "20% de 181 a 360, 17,5% de 361 a 720 e 15% acima de 720 dias. IOF regressivo nos " +
      "primeiros 30 dias. Alguns títulos pagam cupons semestrais, tributados na ocorrência.",
    guarantee: {
      kind: "TESOURO_NACIONAL",
      description:
        "O pagamento é de responsabilidade do Tesouro Nacional. Não se aplica o FGC, que " +
        "cobre instituições financeiras privadas, por se tratar de dívida soberana.",
    },
    characteristics: [
      "A recompra diária é feita a preço de mercado, que varia até o vencimento.",
      "Títulos prefixados e IPCA+ oscilam de preço conforme mudam as taxas de juros.",
      "Há taxa de custódia da B3, e a corretora pode ou não cobrar taxa própria.",
    ],
    officialSources: [SOURCE_TESOURO, SOURCE_RECEITA],
  },
  {
    assetClass: "POUPANCA",
    label: "Poupança",
    fullName: "Caderneta de Poupança",
    summary: "Depósito bancário com regra de remuneração definida em lei.",
    whatItIs:
      "A caderneta de poupança é um depósito em conta cuja remuneração segue uma regra " +
      "fixada em lei, vinculada à taxa Selic e à Taxa Referencial. O rendimento é creditado " +
      "na data de aniversário do depósito, a cada mês.",
    issuedBy: "Bancos autorizados a captar depósitos de poupança.",
    liquidity:
      "Saque disponível a qualquer momento. O rendimento do período, porém, só é creditado " +
      "na data de aniversário mensal do depósito: saques antes dessa data não recebem a " +
      "remuneração do mês em curso.",
    taxation: "Rendimentos isentos de Imposto de Renda para pessoa física.",
    guarantee: FGC_GUARANTEE,
    characteristics: [
      "A remuneração segue regra legal, igual em todos os bancos.",
      "O rendimento é creditado apenas na data de aniversário mensal do depósito.",
    ],
    officialSources: [SOURCE_FGC, SOURCE_RECEITA],
  },
  {
    assetClass: "ACAO",
    label: "Ação",
    fullName: "Ação",
    summary: "Fração do capital social de uma companhia aberta.",
    whatItIs:
      "Quem detém uma ação é sócio da companhia na proporção das ações que possui. Esse " +
      "vínculo dá direito a participar dos resultados distribuídos — dividendos e juros " +
      "sobre capital próprio — e, no caso das ações ordinárias, a votar em assembleia. " +
      "O preço é formado continuamente na bolsa pela negociação entre participantes.",
    issuedBy: "Companhias abertas registradas na CVM.",
    liquidity:
      "Negociada em bolsa nos dias e horários de pregão. A facilidade de negociar varia " +
      "muito entre papéis: algumas ações têm alto volume diário, outras negociam pouco, o " +
      "que afeta a diferença entre preço de compra e de venda.",
    taxation:
      "Ganho de capital em operações comuns é tributado em 15%, apurado e recolhido pelo " +
      "próprio investidor via DARF, com isenção mensal para vendas dentro do limite legal. " +
      "Operações de day trade têm alíquota de 20%. Dividendos e JCP seguem regra própria. " +
      "A apuração é responsabilidade do investidor.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "Não há prazo de vencimento nem valor de resgate contratado.",
      "O preço oscila continuamente durante o pregão.",
      "A apuração e o recolhimento do imposto sobre ganho são responsabilidade do investidor.",
    ],
    officialSources: [SOURCE_STATUS_INVEST, SOURCE_B3, SOURCE_RECEITA],
  },
  {
    assetClass: "BDR",
    label: "BDR",
    fullName: "Brazilian Depositary Receipt",
    summary: "Recibo negociado no Brasil que representa um ativo emitido no exterior.",
    whatItIs:
      "O BDR é um certificado negociado na B3 que representa ações de empresas listadas " +
      "fora do Brasil. Uma instituição depositária mantém os papéis originais no exterior e " +
      "emite os recibos aqui, permitindo negociá-los em reais.",
    issuedBy: "Instituições depositárias autorizadas, com lastro em valores mobiliários estrangeiros.",
    liquidity:
      "Negociado em bolsa no pregão brasileiro. O volume costuma ser menor que o do papel " +
      "original em sua bolsa de origem.",
    taxation:
      "Ganho de capital tributado em 15% em operações comuns e 20% em day trade, sem a " +
      "isenção mensal aplicável a ações brasileiras. A apuração é responsabilidade do investidor.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "O preço reflete tanto o ativo no exterior quanto a variação cambial.",
      "Não confere ao detentor os mesmos direitos societários do acionista direto.",
      "Não se aplica a isenção mensal de ganho de capital das ações brasileiras.",
    ],
    officialSources: [SOURCE_STATUS_INVEST, SOURCE_B3, SOURCE_RECEITA],
  },
  {
    assetClass: "FII",
    label: "FII",
    fullName: "Fundo de Investimento Imobiliário",
    summary: "Fundo que reúne recursos para aplicar no mercado imobiliário.",
    whatItIs:
      "O FII reúne recursos de vários cotistas para investir em imóveis físicos — lajes " +
      "corporativas, galpões, shoppings — ou em papéis do setor, como CRI e cotas de outros " +
      "fundos. Um gestor profissional administra a carteira segundo o regulamento do fundo, " +
      "e as cotas são negociadas em bolsa.",
    issuedBy: "Fundos constituídos e registrados na CVM, com CNPJ próprio.",
    liquidity:
      "As cotas são negociadas em bolsa durante o pregão. Fundos fechados, que é a forma " +
      "usual, não permitem resgate junto ao fundo: a saída se dá pela negociação das cotas " +
      "no mercado, cujo volume varia bastante entre fundos.",
    taxation:
      "Os rendimentos distribuídos mensalmente são isentos de IR para pessoa física quando " +
      "cumpridas as condições legais — entre elas o fundo ter suas cotas negociadas em bolsa, " +
      "ter número mínimo de cotistas e o cotista não deter participação relevante no fundo. " +
      "O ganho na negociação de cotas é tributado em 20%, apurado pelo investidor.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "Tem CNPJ próprio, o que permite consultar o registro e os informes na CVM.",
      "O regulamento define a política de investimento e as taxas cobradas.",
      "Cobra taxa de administração e, em alguns casos, taxa de performance.",
      "A cota negociada em bolsa pode ter preço diferente do valor patrimonial informado.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_STATUS_INVEST, SOURCE_B3],
  },
  {
    assetClass: "FIAGRO",
    label: "Fiagro",
    fullName: "Fundo de Investimento nas Cadeias Produtivas Agroindustriais",
    summary: "Fundo voltado a ativos das cadeias produtivas do agronegócio.",
    whatItIs:
      "O Fiagro segue estrutura semelhante à do FII, com foco no agronegócio: pode investir " +
      "em direitos creditórios do setor, imóveis rurais, participações em empresas agro e " +
      "títulos como CRA, conforme a política definida em seu regulamento.",
    issuedBy: "Fundos constituídos e registrados na CVM, com CNPJ próprio.",
    liquidity:
      "Cotas negociadas em bolsa. Na forma fechada, usual, não há resgate junto ao fundo — " +
      "a saída ocorre pela negociação das cotas no mercado.",
    taxation:
      "Regra de isenção sobre rendimentos distribuídos para pessoa física segue condições " +
      "legais semelhantes às dos FIIs. Ganho na negociação de cotas é tributado, com apuração " +
      "pelo investidor. As condições específicas devem ser conferidas na fonte oficial.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "Tem CNPJ próprio, com registro e informes consultáveis na CVM.",
      "Exposição concentrada nas cadeias produtivas do agronegócio.",
      "O regulamento define quais ativos o fundo pode deter.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_STATUS_INVEST, SOURCE_B3],
  },
  {
    assetClass: "ETF",
    label: "ETF",
    fullName: "Exchange Traded Fund — fundo de índice",
    summary: "Fundo negociado em bolsa que replica um índice de referência.",
    whatItIs:
      "O ETF é um fundo cuja carteira busca reproduzir a composição de um índice — de ações, " +
      "renda fixa ou outra classe. Suas cotas são negociadas em bolsa como uma ação, o que " +
      "permite acompanhar um conjunto amplo de ativos por meio de um único papel.",
    issuedBy: "Gestoras autorizadas pela CVM, com fundo registrado e CNPJ próprio.",
    liquidity:
      "Cotas negociadas em bolsa durante o pregão. Há ainda o mecanismo de criação e resgate " +
      "de cotas por participantes autorizados, que tende a aproximar o preço da cota do valor " +
      "da carteira.",
    taxation:
      "ETFs de renda variável: ganho de capital tributado em 15% em operações comuns e 20% em " +
      "day trade, sem a isenção mensal das ações. ETFs de renda fixa seguem regra própria, com " +
      "alíquota conforme o prazo médio da carteira e retenção na fonte.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "A carteira busca acompanhar um índice divulgado publicamente.",
      "Cobra taxa de administração, informada no regulamento.",
      "Pode haver diferença entre o desempenho do fundo e o do índice de referência.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_B3, SOURCE_RECEITA],
  },
  {
    assetClass: "FUNDO",
    label: "Fundo",
    fullName: "Fundo de Investimento",
    summary: "Veículo coletivo que reúne recursos de cotistas sob gestão profissional.",
    whatItIs:
      "Um fundo de investimento reúne o dinheiro de vários cotistas em uma carteira única, " +
      "administrada por um gestor profissional segundo as regras do regulamento. O que o " +
      "fundo pode ou não deter, quanto cobra e como funcionam aplicações e resgates está " +
      "todo definido nesse documento e na lâmina.",
    issuedBy: "Administradoras e gestoras autorizadas pela CVM. Cada fundo tem CNPJ próprio.",
    liquidity:
      "Definida no regulamento por dois prazos: o de cotização, que é quando o valor da cota " +
      "de saída é calculado, e o de liquidação, que é quando o dinheiro chega à conta. Ambos " +
      "variam de um dia útil a vários meses conforme o fundo.",
    taxation:
      "Fundos abertos de renda fixa e multimercado sofrem o come-cotas, antecipação semestral " +
      "do IR em maio e novembro, com alíquota conforme a classificação de prazo do fundo, e " +
      "ajuste no resgate pela tabela regressiva. Fundos de ações seguem alíquota própria " +
      "apenas no resgate. A classificação exata consta no regulamento.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "Tem CNPJ próprio, com registro, regulamento e informes consultáveis na CVM.",
      "Cobra taxa de administração e, dependendo do fundo, taxa de performance.",
      "Os prazos de cotização e liquidação determinam quando o resgate chega à conta.",
      "O patrimônio do fundo é separado do patrimônio do administrador.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_RECEITA],
  },
  {
    assetClass: "PREVIDENCIA",
    label: "Previdência",
    fullName: "Plano de previdência privada (PGBL / VGBL)",
    summary: "Plano de acumulação de longo prazo operado por seguradora.",
    whatItIs:
      "Planos de previdência privada acumulam recursos em um fundo vinculado ao plano, " +
      "operado por uma seguradora e supervisionado pela SUSEP. O PGBL permite deduzir as " +
      "contribuições na declaração completa do IR dentro do limite legal, e na saída tributa " +
      "o valor total resgatado. O VGBL não permite essa dedução e tributa apenas o rendimento.",
    issuedBy: "Seguradoras e entidades abertas de previdência complementar, sob supervisão da SUSEP.",
    liquidity:
      "Resgates seguem as regras do plano, incluindo prazo de carência inicial e intervalos " +
      "mínimos entre resgates. É possível portar o plano para outra instituição sem que isso " +
      "seja tratado como resgate.",
    taxation:
      "Na contratação escolhe-se entre duas tabelas. A regressiva parte de 35% e cai até 10% " +
      "conforme o tempo de cada aporte. A progressiva segue a tabela do IR sobre pessoa física, " +
      "com retenção na fonte e ajuste na declaração. A base de cálculo difere entre PGBL e VGBL.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "Não conta com cobertura do FGC; a estrutura é de seguro, supervisionada pela SUSEP.",
      "A escolha da tabela de tributação é feita na contratação e tem regras próprias de alteração.",
      "A portabilidade entre planos e instituições não caracteriza resgate.",
      "Não entra em inventário, seguindo regra própria de designação de beneficiários.",
    ],
    officialSources: [SOURCE_SUSEP, SOURCE_RECEITA],
  },
  {
    assetClass: "COE",
    label: "COE",
    fullName: "Certificado de Operações Estruturadas",
    summary: "Instrumento que combina componentes de renda fixa e derivativos.",
    whatItIs:
      "O COE é emitido por um banco e empacota, em um único produto, uma estrutura montada " +
      "com derivativos e um componente de renda fixa. As regras de pagamento dependem do " +
      "comportamento de um ativo de referência e estão descritas no Documento de Informações " +
      "Essenciais, o DIE, que acompanha cada emissão. Há COEs com valor nominal protegido e " +
      "COEs com valor nominal em risco.",
    issuedBy: "Bancos autorizados a emitir certificados de operações estruturadas.",
    liquidity:
      "Em regra mantido até o vencimento. A saída antecipada depende de recompra pelo emissor, " +
      "em condições determinadas por ele no momento.",
    taxation:
      "Tributado como aplicação de renda fixa, com IR na fonte em alíquota regressiva pelo " +
      "prazo, de 22,5% a 15%.",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "Não conta com cobertura do FGC.",
      "As regras de pagamento estão no Documento de Informações Essenciais (DIE) da emissão.",
      "Modalidades de valor nominal protegido e de valor nominal em risco têm estruturas distintas.",
      "O resgate antes do vencimento depende de recompra pelo emissor.",
    ],
    officialSources: [SOURCE_B3, SOURCE_RECEITA],
  },
  {
    assetClass: "NAO_CLASSIFICADO",
    label: "A classificar",
    fullName: "Ativo ainda não classificado",
    summary: "O sistema não conseguiu determinar o tipo deste ativo com segurança.",
    whatItIs:
      "Não foi possível identificar o tipo deste ativo a partir do nome e do CNPJ informados. " +
      "Em vez de exibir uma ficha que pode não corresponder ao ativo real, preferimos deixar " +
      "isso explícito: você pode ajustar a classificação manualmente ou conferir o CNPJ nas " +
      "fontes oficiais.",
    issuedBy: "Não determinado.",
    liquidity: "Não determinada.",
    taxation: "Não determinada.",
    guarantee: {
      kind: "SEM_GARANTIA_ESPECIFICA",
      description:
        "Não determinada. Sem identificar o tipo do ativo, não é possível descrever a " +
        "estrutura de garantia aplicável.",
    },
    characteristics: [
      "Confira o CNPJ informado — um dígito trocado leva a outra entidade.",
      "Você pode definir a classificação manualmente na ficha do ativo.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_B3],
  },
];

const PROFILE_INDEX = new Map<AssetClass, AssetProfile>(
  PROFILE_LIST.map((profile) => [profile.assetClass, profile]),
);

export const ASSET_PROFILES = PROFILE_LIST;

/** Ficha educativa de uma classe. Sempre retorna algo — nunca quebra a UI. */
export function profileFor(assetClass: AssetClass): AssetProfile {
  const profile = PROFILE_INDEX.get(assetClass);
  if (profile) return profile;

  const fallback = PROFILE_INDEX.get("NAO_CLASSIFICADO");
  if (!fallback) throw new Error("Catálogo sem ficha de fallback.");
  return fallback;
}
