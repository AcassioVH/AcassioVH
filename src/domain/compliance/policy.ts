/**
 * Política de conformidade — Resolução CVM 19.
 *
 * O produto se apoia na exceção para relatórios puramente descritivos de
 * composição de carteira. Manter-se dentro dessa exceção depende de uma
 * disciplina de linguagem que não pode depender só de boa vontade de quem
 * escreve, então ela vive aqui e é verificada por teste automatizado
 * (`tests/compliance.test.ts`), que quebra o CI quando violada.
 */

/** Aviso legal curto, para rodapés de card e barras compactas. */
export const DISCLAIMER_SHORT =
  "Conteúdo meramente informativo. Não constitui recomendação de investimento.";

/**
 * Aviso legal completo, para rodapé de página e documentos legais.
 *
 * Ficou desatualizado por uma versão inteira: descrevia a organização da
 * carteira informada pelo usuário, que era o produto anterior. O site não
 * recebe carteira nenhuma desde a reconstrução — descrever um tratamento de
 * dados que não acontece é defeito de conformidade, não só de texto.
 */
export const DISCLAIMER_FULL =
  "A Acássium Invest publica conteúdo educativo sobre tipos de produto de " +
  "investimento do mercado brasileiro. Não recomendamos, avaliamos ou sugerimos a " +
  "compra, venda ou realocação de qualquer ativo, e não afirmamos rentabilidade — " +
  "para conferir valores e regras vigentes, consulte sempre as fontes oficiais " +
  "indicadas em cada verbete. Conteúdo meramente informativo, não constitui " +
  "recomendação de investimento.";

/** Explicação do limite, usada na landing e na seção institucional. */
export const SCOPE_STATEMENT =
  "Descrevemos como cada produto funciona. Não dizemos o que fazer com isso.";

/**
 * Vocabulário incompatível com um relatório descritivo.
 *
 * Cada entrada é uma expressão que, aparecendo em conteúdo voltado ao usuário,
 * sinaliza recomendação, juízo de valor sobre um ativo, ou afirmação de
 * rentabilidade. O teste de conformidade varre o catálogo educativo e as
 * strings desta política atrás destes padrões.
 *
 * A lista é conservadora de propósito: falso positivo custa uma reescrita de
 * frase, falso negativo custa exposição regulatória.
 */
export const FORBIDDEN_PATTERNS: readonly { pattern: RegExp; reason: string }[] = [
  { pattern: /\brecomend/i, reason: "recomendação explícita" },
  { pattern: /\bindicamos\b/i, reason: "recomendação explícita" },
  { pattern: /\bsugerimos\b/i, reason: "recomendação explícita" },
  { pattern: /\baconselh/i, reason: "aconselhamento" },
  { pattern: /\bvocê deve (comprar|vender|investir|aplicar|migrar|realocar)/i, reason: "instrução de alocação" },
  {
    // Ancorado em posição de frase de propósito: em português, "venda" e
    // "compra" são também substantivos comuns ("preço de compra e de venda"),
    // e o imperativo só aparece iniciando oração ou logo após "não".
    pattern: /(^|[.!?;:]\s+|\bnão\s+)(compre|venda|invista|aplique|realoque|migre)\b/i,
    reason: "imperativo de alocação",
  },
  { pattern: /\bmelhor (ativo|investimento|opção|escolha|alternativa)/i, reason: "juízo comparativo" },
  { pattern: /\bpior (ativo|investimento|opção|escolha|alternativa)/i, reason: "juízo comparativo" },
  { pattern: /\bvale a pena\b/i, reason: "juízo de valor" },
  { pattern: /\bboa (opção|escolha|alternativa|aplicação)/i, reason: "juízo de valor" },
  { pattern: /\bmá (opção|escolha|alternativa|aplicação)/i, reason: "juízo de valor" },
  { pattern: /\bativo (bom|ruim|excelente|péssimo)\b/i, reason: "qualificação de ativo" },
  { pattern: /\brentabilidade de \d/i, reason: "afirmação de rentabilidade" },
  { pattern: /\brende \d/i, reason: "afirmação de rentabilidade" },
  { pattern: /\bretorno (esperado|estimado|previsto|projetado)/i, reason: "projeção de retorno" },
  { pattern: /\bganho (garantido|certo)/i, reason: "promessa de retorno" },
  { pattern: /\bvai (subir|cair|valorizar|desvalorizar)/i, reason: "previsão de preço" },
  { pattern: /\btendência de (alta|baixa)/i, reason: "previsão de preço" },
  { pattern: /\boportunidade\b/i, reason: "linguagem de indução" },
  { pattern: /\bideal para (seu|sua|o seu|a sua) perfil/i, reason: "adequação de perfil" },
  { pattern: /\bmais seguro que\b/i, reason: "comparação de risco" },
  { pattern: /\bsem risco\b/i, reason: "afirmação sobre risco" },
  { pattern: /\bgarantia de (lucro|ganho|retorno)/i, reason: "promessa de retorno" },
];

export type ComplianceViolation = {
  readonly source: string;
  readonly excerpt: string;
  readonly reason: string;
};

/**
 * Varre um texto atrás de vocabulário proibido.
 *
 * Usada pelo teste de conformidade e disponível para validar qualquer conteúdo
 * que venha a ser gerado dinamicamente no futuro (ex.: resumos do Acássium
 * News na Fase 2, que serão texto de terceiros e precisam do mesmo filtro).
 */
export function findViolations(text: string, source: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
    const match = pattern.exec(text);
    if (!match) continue;

    const start = Math.max(0, match.index - 40);
    const end = Math.min(text.length, match.index + match[0].length + 40);
    violations.push({
      source,
      excerpt: `…${text.slice(start, end).trim()}…`,
      reason,
    });
  }

  return violations;
}
