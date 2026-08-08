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

const SOURCE_BCB = {
  label: "Banco Central do Brasil",
  url: "https://www.bcb.gov.br",
  whatYouFindThere: "normas do instrumento, dados do emissor e regras de câmbio",
} as const;

const SOURCE_CVM = {
  label: "CVM",
  url: "https://www.gov.br/cvm/pt-br",
  whatYouFindThere: "regulamentação aplicável e registro dos participantes do mercado",
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
    liquidityTag: "Diária ou no vencimento",
    taxTag: "IR regressivo · 22,5% a 15%",
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
    liquidityTag: "Após a carência legal",
    taxTag: "Isento de IR para pessoa física",
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
    liquidityTag: "Após a carência legal",
    taxTag: "Isento de IR para pessoa física",
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
    liquidityTag: "Em regra no vencimento",
    taxTag: "IR regressivo · 22,5% a 15%",
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
    liquidityTag: "Mercado secundário",
    taxTag: "Isento de IR para pessoa física",
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
    liquidityTag: "Mercado secundário",
    taxTag: "Isento de IR para pessoa física",
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
    liquidityTag: "Mercado secundário",
    taxTag: "IR regressivo · incentivada é isenta",
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
      "Tesouro Direto. Os principais títulos são o Tesouro Selic (pós-fixado, acompanha a " +
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
    liquidityTag: "Recompra diária pelo Tesouro",
    taxTag: "IR regressivo · 22,5% a 15%",
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
    liquidityTag: "Saque a qualquer momento",
    taxTag: "Isento de IR para pessoa física",
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
    liquidityTag: "Pregão da bolsa",
    taxTag: "15% no ganho · 20% day trade",
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
    liquidityTag: "Pregão da bolsa",
    taxTag: "15% no ganho · sem isenção mensal",
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
    liquidityTag: "Pregão da bolsa",
    taxTag: "Rendimento isento sob condições · 20% no ganho",
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
    liquidityTag: "Pregão da bolsa",
    taxTag: "Rendimento isento sob condições · ganho tributado",
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
    liquidityTag: "Pregão da bolsa",
    taxTag: "15% no ganho · sem isenção mensal",
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
    liquidityTag: "Prazos de cotização e liquidação",
    taxTag: "Come-cotas em parte dos fundos",
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
    liquidityTag: "Conforme a carência do plano",
    taxTag: "Tabela regressiva 35% a 10%, ou progressiva",
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
    liquidityTag: "Em regra no vencimento",
    taxTag: "IR regressivo · 22,5% a 15%",
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
    assetClass: "RDB",
    label: "RDB",
    fullName: "Recibo de Depósito Bancário",
    summary: "Depósito a prazo em banco, sem possibilidade de transferência.",
    whatItIs:
      "O RDB tem a mesma natureza do CDB — é um depósito a prazo remunerado feito em uma " +
      "instituição financeira. A diferença está numa característica jurídica: o RDB é " +
      "inegociável e intransferível, então não existe mercado secundário para ele. Quem " +
      "aplica permanece com o título até o vencimento ou resgata junto ao próprio emissor, " +
      "quando o contrato permitir.",
    issuedBy:
      "Bancos, financeiras, cooperativas de crédito e sociedades de crédito ao " +
      "microempreendedor.",
    liquidity:
      "Não pode ser negociado nem transferido a terceiros. A saída antes do vencimento só " +
      "existe se o contrato previr resgate antecipado junto ao emissor, nas condições " +
      "definidas ali.",
    liquidityTag: "Só com o emissor, sem repasse",
    taxation:
      "Imposto de Renda retido na fonte em alíquota regressiva pelo prazo: 22,5% até 180 " +
      "dias, 20% de 181 a 360, 17,5% de 361 a 720 e 15% acima de 720 dias. IOF regressivo " +
      "nos primeiros 30 dias.",
    taxTag: "IR regressivo · 22,5% a 15%",
    guarantee: FGC_GUARANTEE,
    characteristics: [
      "É intransferível por definição legal, então não há mercado secundário.",
      "Cooperativas de crédito também emitem RDB, e nesse caso a garantia aplicável é a do FGCoop, não a do FGC.",
      "A remuneração e o prazo são definidos na contratação, como no CDB.",
    ],
    officialSources: [SOURCE_FGC, SOURCE_RECEITA, SOURCE_BCB],
  },
  {
    assetClass: "LF",
    label: "LF",
    fullName: "Letra Financeira",
    summary: "Título de dívida bancária de prazo longo e aplicação mínima elevada.",
    whatItIs:
      "A Letra Financeira é um instrumento que os bancos usam para captar recursos de prazo " +
      "mais longo do que o de um CDB comum. A norma estabelece prazo mínimo de dois anos e " +
      "valor mínimo de aplicação alto, o que na prática restringe o instrumento a investidores " +
      "de maior porte. Existe também a letra financeira subordinada, que em caso de " +
      "liquidação do emissor é paga depois dos demais credores.",
    issuedBy: "Bancos múltiplos, comerciais, de investimento e outras instituições autorizadas.",
    liquidity:
      "A norma veda o resgate antecipado junto ao emissor antes do prazo mínimo. A saída, " +
      "quando ocorre, é por negociação no mercado secundário.",
    liquidityTag: "Prazo mínimo de dois anos",
    taxation:
      "Imposto de Renda na fonte em alíquota regressiva pelo prazo. Como o prazo mínimo é " +
      "de dois anos, na prática a alíquota aplicável costuma ser a de 15%.",
    taxTag: "IR regressivo · na prática 15%",
    guarantee: {
      kind: "SEM_GARANTIA_ESPECIFICA",
      description:
        "Não conta com cobertura do FGC — a Letra Financeira está expressamente fora da " +
        "lista de instrumentos garantidos. O pagamento depende da capacidade financeira do " +
        "banco emissor. Na modalidade subordinada, o pagamento fica atrás dos demais " +
        "credores na ordem de recebimento.",
    },
    characteristics: [
      "Prazo mínimo de dois anos, definido em norma.",
      "Valor mínimo de aplicação elevado, o que limita o acesso.",
      "Não é coberta pelo FGC, ao contrário do CDB emitido pelo mesmo banco.",
      "A modalidade subordinada tem posição própria na ordem de pagamento.",
    ],
    officialSources: [SOURCE_BCB, SOURCE_RECEITA, SOURCE_B3],
  },
  {
    assetClass: "LIG",
    label: "LIG",
    fullName: "Letra Imobiliária Garantida",
    summary: "Título bancário com carteira de créditos imobiliários segregada como garantia.",
    whatItIs:
      "A LIG é o instrumento brasileiro equivalente ao que o mercado internacional chama de " +
      "covered bond. Ela tem uma característica estrutural que a distingue das demais letras: " +
      "existe uma carteira de ativos vinculada à emissão, segregada do patrimônio do banco. " +
      "Se o emissor quebrar, essa carteira não entra na massa falida e responde pelo " +
      "pagamento dos titulares da letra — daí o nome de dupla garantia, o banco e a carteira.",
    issuedBy: "Instituições financeiras autorizadas a conceder crédito imobiliário.",
    liquidity:
      "Há prazo mínimo de vencimento definido em norma, e durante ele não há resgate junto " +
      "ao emissor. A negociação ocorre no mercado secundário.",
    liquidityTag: "Prazo mínimo em norma",
    taxation:
      "Rendimentos isentos de Imposto de Renda para pessoa física residente no país, " +
      "conforme a legislação vigente aplicável ao instrumento.",
    taxTag: "Isento de IR para pessoa física",
    guarantee: {
      kind: "GARANTIA_REAL",
      description:
        "Não conta com cobertura do FGC. Em compensação, tem estrutura própria: uma carteira " +
        "de ativos vinculada e segregada do patrimônio do emissor, que não entra em eventual " +
        "processo de falência e responde pelo pagamento. A composição dessa carteira e o " +
        "índice mínimo de cobertura estão definidos em norma e no documento da emissão.",
    },
    characteristics: [
      "A carteira de ativos vinculada é segregada do patrimônio do banco por lei.",
      "Não é coberta pelo FGC, e a estrutura de garantia é de natureza diferente.",
      "Há prazo mínimo de vencimento e regras de composição da carteira definidos em norma.",
      "A isenção de IR para pessoa física decorre de lei e pode ser alterada por lei.",
    ],
    officialSources: [SOURCE_BCB, SOURCE_RECEITA, SOURCE_B3],
  },
  {
    assetClass: "DPGE",
    label: "DPGE",
    fullName: "Depósito a Prazo com Garantia Especial",
    summary: "Depósito bancário com teto de cobertura do FGC próprio, mais alto que o comum.",
    whatItIs:
      "O DPGE é um depósito a prazo criado para permitir que instituições de menor porte " +
      "captem recursos com uma garantia ampliada do FGC. Ele tem limite de cobertura próprio, " +
      "distinto e superior ao teto aplicável aos demais depósitos, e exige que o emissor " +
      "vincule ativos como lastro da operação junto ao Fundo.",
    issuedBy:
      "Bancos comerciais, múltiplos, de investimento, de desenvolvimento e sociedades de " +
      "crédito, financiamento e investimento, dentro dos limites autorizados a cada uma.",
    liquidity:
      "Há prazo mínimo definido em norma e não há resgate antecipado junto ao emissor antes " +
      "dele. É um instrumento pensado para permanecer até o vencimento.",
    liquidityTag: "Até o vencimento, com prazo mínimo",
    taxation:
      "Imposto de Renda na fonte em alíquota regressiva pelo prazo, de 22,5% a 15%, com IOF " +
      "regressivo nos primeiros 30 dias — a mesma regra dos demais depósitos a prazo.",
    taxTag: "IR regressivo · 22,5% a 15%",
    guarantee: {
      kind: "FGC",
      description:
        "Coberto pelo FGC com limite próprio, distinto e mais alto que o teto aplicável aos " +
        "demais depósitos, por CPF e por instituição. Os valores vigentes são publicados pelo " +
        "próprio FGC e mudam por decisão dele. A operação exige lastro em ativos vinculados ao " +
        "Fundo, o que a distingue de um depósito a prazo comum.",
    },
    characteristics: [
      "Tem teto de cobertura do FGC próprio, separado do limite dos demais depósitos.",
      "O emissor precisa vincular ativos como lastro junto ao FGC.",
      "Há prazo mínimo definido em norma, sem resgate antecipado.",
      "É emitido sobretudo por instituições de menor porte, que é a finalidade do instrumento.",
    ],
    officialSources: [SOURCE_FGC, SOURCE_BCB, SOURCE_RECEITA],
  },
  {
    assetClass: "CDCA",
    label: "CDCA",
    fullName: "Certificado de Direitos Creditórios do Agronegócio",
    summary: "Título emitido por empresa do agro, lastreado em direitos creditórios do setor.",
    whatItIs:
      "O CDCA é emitido por cooperativas e empresas que atuam na produção, comercialização, " +
      "beneficiamento ou industrialização de produtos agropecuários. O lastro são direitos " +
      "creditórios do próprio agronegócio, vinculados ao título. A diferença em relação ao CRA " +
      "está em quem emite: no CRA é uma securitizadora, e no CDCA é a própria empresa do setor.",
    issuedBy:
      "Cooperativas e pessoas jurídicas que atuam nas cadeias do agronegócio, conforme a " +
      "legislação do setor.",
    liquidity:
      "Negociado no mercado secundário, com volume geralmente reduzido. Não há resgate " +
      "antecipado junto ao emissor.",
    liquidityTag: "Mercado secundário",
    taxation:
      "Rendimentos isentos de Imposto de Renda para pessoa física, conforme a legislação " +
      "vigente aplicável aos títulos do agronegócio.",
    taxTag: "Isento de IR para pessoa física",
    guarantee: {
      kind: "GARANTIA_REAL",
      description:
        "Não conta com cobertura do FGC. Os direitos creditórios que lastreiam a emissão ficam " +
        "vinculados ao título, e pode haver garantias adicionais previstas no documento da " +
        "emissão. O pagamento depende do emissor e dos devedores desses créditos.",
    },
    characteristics: [
      "Quem emite é a própria empresa do agronegócio, e não uma securitizadora.",
      "Os direitos creditórios que lastreiam a emissão ficam vinculados ao título.",
      "Exposição concentrada no emissor e na cadeia do agronegócio.",
    ],
    officialSources: [SOURCE_B3, SOURCE_RECEITA, SOURCE_CVM],
  },
  {
    assetClass: "UNIT",
    label: "Unit",
    fullName: "Unit — certificado de depósito de ações",
    summary: "Um único ativo negociado que reúne mais de uma classe de ação da companhia.",
    whatItIs:
      "A Unit é um certificado que agrupa, num único ativo negociável, uma combinação fixa de " +
      "ações de classes diferentes da mesma companhia — tipicamente uma ordinária mais duas " +
      "preferenciais, mas a proporção varia e está definida na emissão. Quem compra uma Unit " +
      "adquire o conjunto, não uma ação isolada. Na B3 elas costumam ser identificadas pelo " +
      "final 11 no código de negociação.",
    issuedBy: "Companhias abertas registradas na CVM, por meio de instituição depositária.",
    liquidity:
      "Negociada em bolsa nos dias e horários de pregão, como uma ação. Em várias companhias a " +
      "Unit concentra o volume de negociação, ficando as classes individuais com menos giro.",
    liquidityTag: "Pregão da bolsa",
    taxation:
      "Segue a regra das ações: ganho de capital tributado em 15% em operações comuns e 20% em " +
      "day trade, com apuração e recolhimento pelo próprio investidor via DARF. Proventos " +
      "seguem a regra aplicável a cada classe de ação que compõe o certificado.",
    taxTag: "15% no ganho · 20% day trade",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "A composição — quantas ações de cada classe formam uma Unit — está definida na emissão.",
      "O código terminado em 11 na B3 costuma indicar Unit, mas o mesmo final também é usado por ETFs e fundos listados.",
      "Os direitos de voto e de proventos são os das ações que a compõem, na proporção do certificado.",
      "É possível desmembrar a Unit nas ações que a formam, conforme as regras da emissão.",
    ],
    officialSources: [SOURCE_B3, SOURCE_STATUS_INVEST, SOURCE_RECEITA],
  },
  {
    assetClass: "FI_INFRA",
    label: "FI-Infra",
    fullName: "Fundo Incentivado de Investimento em Infraestrutura",
    summary: "Fundo listado que investe em títulos de dívida de projetos de infraestrutura.",
    whatItIs:
      "O FI-Infra reúne recursos de cotistas para investir majoritariamente em debêntures " +
      "incentivadas e outros títulos de dívida ligados a projetos de infraestrutura. A carteira " +
      "é de crédito, mas as cotas são negociadas em bolsa e têm preço formado na negociação — " +
      "por isso o comportamento do preço da cota não acompanha uma regra contratada.",
    issuedBy: "Gestoras autorizadas pela CVM. Cada fundo tem CNPJ próprio.",
    liquidity:
      "Cotas negociadas em bolsa durante o pregão. Na forma fechada, usual, não há resgate " +
      "junto ao fundo — a saída ocorre pela venda das cotas no mercado.",
    liquidityTag: "Pregão da bolsa",
    taxation:
      "Rendimentos distribuídos a pessoa física são isentos de IR quando cumpridas as condições " +
      "da legislação de incentivo à infraestrutura. O ganho na negociação das cotas é tributado, " +
      "com apuração pelo investidor. As condições específicas devem ser conferidas na fonte oficial.",
    taxTag: "Rendimento isento sob condições",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "A carteira é composta majoritariamente por títulos de dívida de projetos de infraestrutura.",
      "Tem CNPJ próprio, com regulamento e informes consultáveis na CVM.",
      "A cota negociada em bolsa pode ter preço diferente do valor patrimonial informado.",
      "Cobra taxa de administração, definida no regulamento.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_B3, SOURCE_RECEITA],
  },
  {
    assetClass: "FIP",
    label: "FIP",
    fullName: "Fundo de Investimento em Participações",
    summary: "Fundo que compra participação em empresas fechadas e participa da gestão delas.",
    whatItIs:
      "O FIP investe em participações societárias de companhias, em geral fechadas, e a " +
      "regulamentação exige que ele participe do processo decisório dessas empresas — com " +
      "assento no conselho ou influência efetiva na definição da política estratégica. É o " +
      "veículo usado pelo mercado para o que se chama de private equity e venture capital. O " +
      "retorno ao cotista ocorre quando o fundo vende as participações ou recebe proventos delas.",
    issuedBy: "Gestoras autorizadas pela CVM. Cada fundo tem CNPJ próprio.",
    liquidity:
      "Constituído sob a forma fechada, com prazo de duração definido. Não há resgate junto ao " +
      "fundo antes da liquidação, e o mercado secundário de cotas é restrito. Os aportes " +
      "costumam ser feitos em chamadas de capital ao longo do tempo, e não de uma vez.",
    liquidityTag: "Fechado, até a liquidação",
    taxation:
      "A tributação incide sobre os rendimentos distribuídos ao cotista e sobre o ganho na " +
      "alienação de cotas, conforme a regra aplicável ao tipo de fundo e ao enquadramento da " +
      "carteira. As condições específicas devem ser conferidas na fonte oficial.",
    taxTag: "Conforme o enquadramento da carteira",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "A norma exige participação efetiva do fundo no processo decisório das investidas.",
      "É fechado e tem prazo de duração definido em regulamento.",
      "O capital costuma ser integralizado em chamadas ao longo do período de investimento.",
      "Boa parte dos FIPs é destinada exclusivamente a investidores qualificados ou profissionais.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_CVM, SOURCE_RECEITA],
  },
  {
    assetClass: "ETF_INTERNACIONAL",
    label: "ETF internacional",
    fullName: "ETF de índice internacional negociado na B3",
    summary: "Fundo de índice listado no Brasil cuja carteira acompanha um índice de fora.",
    whatItIs:
      "É um ETF constituído no Brasil, com CNPJ brasileiro e negociado em reais na B3, cuja " +
      "carteira busca reproduzir um índice de mercado estrangeiro. Permite acompanhar um " +
      "conjunto de ativos do exterior sem abrir conta fora do país. Como o ativo de referência " +
      "está em outra moeda e a cota é negociada em reais, o preço reflete tanto o índice quanto " +
      "a variação cambial.",
    issuedBy: "Gestoras autorizadas pela CVM, com fundo registrado e CNPJ próprio no Brasil.",
    liquidity:
      "Cotas negociadas em bolsa durante o pregão brasileiro. O horário de negociação daqui nem " +
      "sempre coincide com o do mercado de origem do índice, o que afeta a formação de preço em " +
      "parte do dia.",
    liquidityTag: "Pregão da bolsa brasileira",
    taxation:
      "Ganho de capital tributado em 15% em operações comuns e 20% em day trade, sem a isenção " +
      "mensal aplicável a ações brasileiras. A apuração e o recolhimento são responsabilidade do " +
      "investidor.",
    taxTag: "15% no ganho · sem isenção mensal",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "O preço reflete o índice no exterior e também a variação do câmbio.",
      "O fundo é brasileiro e tem CNPJ próprio, ainda que a carteira seja de ativos externos.",
      "Há fundos com proteção cambial contratada, em que a variação da moeda é neutralizada — a política consta no regulamento.",
      "Pode haver diferença entre o desempenho do fundo e o do índice de referência.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_B3, SOURCE_RECEITA],
  },
  {
    assetClass: "ACAO_EXTERIOR",
    label: "Ação no exterior",
    fullName: "Ação negociada em bolsa estrangeira",
    summary: "Participação em companhia estrangeira, comprada direto na bolsa de origem.",
    whatItIs:
      "É a compra da ação no mercado onde ela é listada, por meio de conta em uma corretora " +
      "no exterior ou de intermediação autorizada. Diferente do BDR, aqui o investidor detém " +
      "o papel original, com os direitos societários que ele confere, e a operação acontece na " +
      "moeda do país de origem.",
    issuedBy: "Companhias listadas em bolsas estrangeiras, sob a regulação do país de origem.",
    liquidity:
      "Negociada no pregão da bolsa de origem, nos horários daquele mercado. A conversão de " +
      "moeda na entrada e na saída depende do câmbio contratado e das regras da instituição " +
      "que intermedeia.",
    liquidityTag: "Pregão da bolsa de origem",
    taxation:
      "Desde a mudança na tributação de aplicações no exterior, os rendimentos e ganhos de " +
      "pessoa física passaram a ser apurados de forma própria, com alíquota específica e " +
      "declaração anual. As regras mudaram recentemente e têm detalhes que dependem da " +
      "estrutura usada — confirme na Receita Federal ou com seu contador.",
    taxTag: "Regra própria de aplicação no exterior",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "O investidor detém o papel original, e não um recibo que o represente.",
      "A operação e a custódia ficam sob a regulação e a proteção do país de origem, não da CVM.",
      "O resultado em reais depende do desempenho do papel e também da variação cambial.",
      "Há obrigações próprias de declaração de bens e direitos no exterior.",
    ],
    officialSources: [SOURCE_RECEITA, SOURCE_BCB, SOURCE_STATUS_INVEST],
  },
  {
    assetClass: "REIT",
    label: "REIT",
    fullName: "Real Estate Investment Trust",
    summary: "Companhia imobiliária listada no exterior, obrigada a distribuir o lucro.",
    whatItIs:
      "O REIT é a estrutura usada no mercado norte-americano para investimento imobiliário " +
      "listado. A legislação de lá dá tratamento tributário próprio à companhia desde que ela " +
      "distribua a maior parte do lucro tributável aos acionistas e mantenha a carteira " +
      "concentrada em imóveis ou em créditos imobiliários. Na prática cumpre função parecida " +
      "com a do FII brasileiro, mas a natureza jurídica é de companhia, não de fundo.",
    issuedBy: "Companhias constituídas e listadas no exterior, sob a regulação do país de origem.",
    liquidity:
      "Negociado no pregão da bolsa de origem. O acesso se dá por conta no exterior ou, em " +
      "parte dos casos, por BDR de REIT negociado na B3.",
    liquidityTag: "Pregão da bolsa de origem",
    taxation:
      "Os proventos costumam sofrer retenção na fonte no país de origem, e no Brasil os " +
      "rendimentos e ganhos seguem a regra de tributação de aplicações no exterior, que mudou " +
      "recentemente. Confirme na Receita Federal ou com seu contador.",
    taxTag: "Retenção na origem + regra do exterior",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "É uma companhia, não um fundo — a estrutura jurídica difere da do FII.",
      "A obrigação de distribuir a maior parte do lucro tributável é condição do regime tributário de lá.",
      "Há REITs de imóveis físicos e REITs de créditos imobiliários, com estruturas distintas.",
      "O resultado em reais depende do desempenho do papel e da variação cambial.",
    ],
    officialSources: [SOURCE_RECEITA, SOURCE_STATUS_INVEST, SOURCE_B3],
  },
  {
    assetClass: "BOND_EXTERIOR",
    label: "Bond",
    fullName: "Título de renda fixa emitido no exterior",
    summary: "Dívida de um governo ou empresa estrangeira, comprada em moeda estrangeira.",
    whatItIs:
      "Bonds são títulos de dívida emitidos fora do Brasil, em moeda estrangeira. Podem ser " +
      "soberanos — os Treasuries do Tesouro norte-americano são o exemplo mais conhecido — ou " +
      "corporativos, emitidos por empresas. A lógica é a mesma de um título de renda fixa " +
      "daqui: há prazo, há uma regra de remuneração e há um emissor que responde pelo pagamento. " +
      "O que muda é a moeda, a jurisdição e quem regula.",
    issuedBy: "Governos e empresas, sob a legislação do país de emissão.",
    liquidity:
      "Negociado no mercado internacional, com liquidez que varia muito entre emissões: papéis " +
      "soberanos de grandes economias costumam ter volume alto, e emissões corporativas " +
      "específicas podem ter volume reduzido. O preço antes do vencimento oscila com as taxas " +
      "de juros do mercado de origem.",
    liquidityTag: "Mercado internacional",
    taxation:
      "Rendimentos e ganhos de pessoa física residente no Brasil seguem a regra de tributação " +
      "de aplicações no exterior, que mudou recentemente e prevê apuração e alíquota próprias. " +
      "Pode haver ainda retenção no país de origem. Confirme na Receita Federal ou com seu contador.",
    taxTag: "Regra própria de aplicação no exterior",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "Não há cobertura do FGC — a garantia, quando existe, é a do emissor e da jurisdição de origem.",
      "O preço antes do vencimento oscila conforme as taxas de juros do mercado de origem.",
      "O resultado em reais depende do papel e também da variação cambial.",
      "Emissões corporativas costumam ter cláusulas próprias, descritas no documento da emissão.",
    ],
    officialSources: [SOURCE_RECEITA, SOURCE_BCB],
  },
  {
    assetClass: "FUNDO_CAMBIAL",
    label: "Fundo cambial",
    fullName: "Fundo de Investimento Cambial",
    summary: "Fundo brasileiro cuja carteira acompanha a variação de uma moeda estrangeira.",
    whatItIs:
      "O fundo cambial tem por política manter a maior parte da carteira atrelada à variação de " +
      "preço de uma moeda estrangeira — na prática, quase sempre o dólar. É o caminho mais " +
      "simples para ter exposição cambial sem abrir conta no exterior nem comprar moeda em " +
      "espécie: aplica-se em reais, e a cota acompanha o câmbio conforme a política do regulamento.",
    issuedBy: "Administradoras e gestoras autorizadas pela CVM. Cada fundo tem CNPJ próprio.",
    liquidity:
      "Aplicação e resgate junto ao próprio fundo, nos prazos de cotização e liquidação " +
      "definidos no regulamento.",
    liquidityTag: "Prazos de cotização e liquidação",
    taxation:
      "Segue a regra dos fundos de investimento em geral: come-cotas semestral em maio e " +
      "novembro para os fundos sujeitos a ele, e ajuste no resgate pela tabela regressiva. A " +
      "classificação exata do fundo consta no regulamento.",
    taxTag: "Come-cotas + tabela regressiva",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "A política de investimento define a qual moeda a carteira se vincula.",
      "Tem CNPJ próprio, com regulamento e informes consultáveis na CVM.",
      "A cota acompanha a variação cambial, e não o desempenho de empresas no exterior.",
      "Cobra taxa de administração, informada no regulamento.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_BCB, SOURCE_RECEITA],
  },
  {
    assetClass: "FUNDO_RENDA_FIXA",
    label: "Fundo de renda fixa",
    fullName: "Fundo de Investimento em Renda Fixa",
    summary: "Fundo com a maior parte da carteira em títulos de dívida.",
    whatItIs:
      "É a classe de fundo cuja política concentra a carteira em ativos de renda fixa — títulos " +
      "públicos, títulos bancários e crédito privado. Dentro dela há subdivisões previstas na " +
      "regulamentação, conforme o tipo de risco que a carteira pode assumir e o prazo médio dos " +
      "papéis, e é o regulamento que diz em qual delas o fundo se enquadra.",
    issuedBy: "Administradoras e gestoras autorizadas pela CVM. Cada fundo tem CNPJ próprio.",
    liquidity:
      "Definida no regulamento pelos prazos de cotização e liquidação. Fundos com carteira de " +
      "títulos públicos de curto prazo costumam ter prazos de um dia útil; fundos com crédito " +
      "privado costumam ter prazos mais longos, porque a carteira demora mais para ser vendida.",
    liquidityTag: "Prazos de cotização e liquidação",
    taxation:
      "Sujeito ao come-cotas, antecipação semestral do IR em maio e novembro, com alíquota " +
      "conforme a classificação de prazo do fundo, e ajuste no resgate pela tabela regressiva de " +
      "22,5% a 15%.",
    taxTag: "Come-cotas + IR regressivo",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "O regulamento define quanto da carteira pode estar em crédito privado.",
      "O patrimônio do fundo é separado do patrimônio do administrador.",
      "A cota varia diariamente, inclusive para baixo, pela marcação a mercado dos títulos.",
      "Cobra taxa de administração, informada no regulamento e na lâmina.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_RECEITA],
  },
  {
    assetClass: "FUNDO_MULTIMERCADO",
    label: "Multimercado",
    fullName: "Fundo de Investimento Multimercado",
    summary: "Fundo que pode combinar várias classes de ativo na mesma carteira.",
    whatItIs:
      "O multimercado é a classe de fundo com a política de investimento mais ampla: pode " +
      "combinar renda fixa, ações, câmbio, derivativos e ativos no exterior na mesma carteira, " +
      "nos limites que o próprio regulamento estabelece. Por isso a leitura do regulamento " +
      "importa mais aqui do que em qualquer outra classe — é ele que diz o que aquele fundo " +
      "específico pode e não pode deter.",
    issuedBy: "Administradoras e gestoras autorizadas pela CVM. Cada fundo tem CNPJ próprio.",
    liquidity:
      "Definida no regulamento. Os prazos de cotização e liquidação de multimercados variam " +
      "bastante — de poucos dias úteis a vários meses — conforme os ativos que a carteira detém.",
    liquidityTag: "Prazos de cotização e liquidação",
    taxation:
      "Sujeito ao come-cotas semestral em maio e novembro, com alíquota conforme a classificação " +
      "de prazo do fundo, e ajuste no resgate pela tabela regressiva. Fundos com política de " +
      "investimento no exterior podem ter enquadramento próprio.",
    taxTag: "Come-cotas + IR regressivo",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "A política de investimento é ampla, e os limites de cada classe de ativo estão no regulamento.",
      "Pode usar derivativos, inclusive com exposição superior ao patrimônio, quando o regulamento permitir.",
      "Parte dos multimercados é destinada apenas a investidores qualificados ou profissionais.",
      "Além da taxa de administração, é comum haver taxa de performance.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_RECEITA],
  },
  {
    assetClass: "FUNDO_ACOES",
    label: "Fundo de ações",
    fullName: "Fundo de Investimento em Ações",
    summary: "Fundo com a maior parte da carteira em ações e ativos equivalentes.",
    whatItIs:
      "É a classe de fundo que mantém a maior parte do patrimônio em ações e em ativos " +
      "equiparados, como bônus de subscrição e certificados de depósito de ações. A " +
      "regulamentação define o percentual mínimo da carteira que precisa estar nesses ativos " +
      "para o fundo se enquadrar na classe, e esse enquadramento é o que determina a regra " +
      "tributária aplicável.",
    issuedBy: "Administradoras e gestoras autorizadas pela CVM. Cada fundo tem CNPJ próprio.",
    liquidity:
      "Aplicação e resgate junto ao fundo, nos prazos definidos em regulamento. O prazo de " +
      "cotização em fundos de ações costuma ser maior que o de fundos de renda fixa, porque a " +
      "carteira precisa ser vendida em pregão.",
    liquidityTag: "Prazos de cotização e liquidação",
    taxation:
      "Não está sujeito ao come-cotas. O Imposto de Renda incide apenas no resgate, em alíquota " +
      "própria da classe, independentemente do prazo de permanência.",
    taxTag: "Sem come-cotas · IR só no resgate",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "O percentual mínimo em ações é o que define o enquadramento na classe.",
      "Não sofre come-cotas, ao contrário dos fundos de renda fixa e multimercado.",
      "A cota varia diariamente conforme o preço das ações em carteira.",
      "Cobra taxa de administração e, com frequência, taxa de performance.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_RECEITA],
  },
  {
    assetClass: "FIDC",
    label: "FIDC",
    fullName: "Fundo de Investimento em Direitos Creditórios",
    summary: "Fundo cuja carteira é formada por recebíveis — dívidas de terceiros a receber.",
    whatItIs:
      "O FIDC compra direitos creditórios: duplicatas, parcelas de cartão, contratos de " +
      "financiamento, aluguéis a receber. Quem paga o fundo são os devedores originais desses " +
      "créditos. A estrutura costuma ser dividida em cotas seniores e subordinadas, e essa " +
      "divisão define a ordem de recebimento — as subordinadas absorvem primeiro as perdas da " +
      "carteira, e é isso que dá às seniores a proteção descrita no regulamento.",
    issuedBy: "Administradoras e gestoras autorizadas pela CVM. Cada fundo tem CNPJ próprio.",
    liquidity:
      "Depende da forma de constituição. Fundos fechados não permitem resgate e a saída ocorre " +
      "pela negociação das cotas, com mercado secundário geralmente restrito. Fundos abertos " +
      "seguem os prazos do regulamento.",
    liquidityTag: "Conforme a forma do fundo",
    taxation:
      "Segue a regra dos fundos de investimento aplicável ao seu enquadramento, com Imposto de " +
      "Renda em alíquota regressiva pelo prazo. A classificação exata consta no regulamento.",
    taxTag: "IR regressivo · conforme enquadramento",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "Quem paga o fundo são os devedores dos créditos comprados, não uma instituição financeira.",
      "A divisão entre cotas seniores e subordinadas define a ordem de recebimento.",
      "A qualidade da carteira e os critérios de elegibilidade dos créditos estão no regulamento.",
      "Historicamente restrito a investidores qualificados, com aberturas previstas na regulamentação vigente.",
    ],
    officialSources: [SOURCE_CVM_FUNDOS, SOURCE_CVM, SOURCE_RECEITA],
  },
  {
    assetClass: "PGBL",
    label: "PGBL",
    fullName: "Plano Gerador de Benefício Livre",
    summary: "Plano de previdência que permite deduzir as contribuições na declaração completa.",
    whatItIs:
      "No PGBL, as contribuições feitas no ano podem ser deduzidas da base de cálculo do " +
      "Imposto de Renda, dentro do limite legal de percentual da renda bruta tributável, e " +
      "desde que o titular use a declaração completa e contribua para a previdência social. " +
      "A contrapartida está na saída: o imposto incide sobre o valor total resgatado ou " +
      "recebido, e não apenas sobre o rendimento.",
    issuedBy:
      "Seguradoras e entidades abertas de previdência complementar, sob supervisão da SUSEP.",
    liquidity:
      "Resgates seguem as regras do plano, com prazo de carência inicial e intervalos mínimos " +
      "entre resgates. A portabilidade para outro plano ou instituição não é tratada como " +
      "resgate e não interrompe a contagem de prazo para fins de tributação.",
    liquidityTag: "Conforme a carência do plano",
    taxation:
      "A dedução das contribuições está limitada a um percentual da renda bruta tributável " +
      "anual e exige declaração completa. Na saída, a base de cálculo é o valor total, e " +
      "aplica-se a tabela escolhida na contratação: a regressiva parte de 35% e cai até 10% " +
      "conforme o tempo de cada aporte, ou a progressiva, que segue a tabela do IR da pessoa física.",
    taxTag: "Deduz na entrada · tributa o total na saída",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "A dedução só faz sentido para quem entrega a declaração completa e contribui para a previdência social.",
      "Na saída o imposto incide sobre o valor total, e não apenas sobre o rendimento.",
      "Não conta com cobertura do FGC; a estrutura é de seguro, supervisionada pela SUSEP.",
      "A portabilidade entre planos e instituições não caracteriza resgate.",
    ],
    officialSources: [SOURCE_SUSEP, SOURCE_RECEITA],
  },
  {
    assetClass: "VGBL",
    label: "VGBL",
    fullName: "Vida Gerador de Benefício Livre",
    summary: "Plano de previdência sem dedução na entrada, que tributa só o rendimento na saída.",
    whatItIs:
      "O VGBL é juridicamente um seguro de pessoas com cobertura por sobrevivência. As " +
      "contribuições não são dedutíveis do Imposto de Renda, e em troca a tributação na saída " +
      "incide apenas sobre o rendimento, não sobre o valor total. É a estrutura usada por quem " +
      "entrega a declaração simplificada, por quem já atingiu o limite de dedução do PGBL, e " +
      "em planejamento sucessório.",
    issuedBy:
      "Seguradoras e entidades abertas de previdência complementar, sob supervisão da SUSEP.",
    liquidity:
      "Resgates seguem as regras do plano, com carência inicial e intervalos mínimos. A " +
      "portabilidade para outro plano ou instituição não é tratada como resgate. A portabilidade " +
      "entre VGBL e PGBL não é permitida — a mudança de modalidade exige resgate.",
    liquidityTag: "Conforme a carência do plano",
    taxation:
      "Não há dedução das contribuições. Na saída, o imposto incide apenas sobre o rendimento, " +
      "pela tabela escolhida na contratação: a regressiva parte de 35% e cai até 10% conforme o " +
      "tempo de cada aporte, ou a progressiva, que segue a tabela do IR da pessoa física.",
    taxTag: "Sem dedução · tributa só o rendimento",
    guarantee: NO_SPECIFIC_GUARANTEE,
    characteristics: [
      "É juridicamente um seguro de pessoas, e não um plano previdenciário em sentido estrito.",
      "Na saída o imposto incide apenas sobre o rendimento.",
      "Não entra em inventário, seguindo regra própria de designação de beneficiários.",
      "Não há portabilidade entre VGBL e PGBL: mudar de modalidade exige resgate.",
    ],
    officialSources: [SOURCE_SUSEP, SOURCE_RECEITA],
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
    liquidityTag: "Não determinada",
    taxTag: "Não determinada",
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
