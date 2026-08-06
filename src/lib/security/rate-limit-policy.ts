/**
 * Política de limite de tentativas — janela deslizante.
 *
 * Função pura de propósito: recebe os instantes das tentativas anteriores e
 * devolve a decisão. Sem banco, sem relógio global, sem I/O. Isso permite
 * testar as bordas que realmente importam — tentativa exatamente no limite da
 * janela, expiração parcial, cálculo do tempo de espera — sem subir Postgres
 * nem depender de `sleep` em teste.
 *
 * A janela é deslizante, e não um balde que zera de hora em hora: com balde
 * fixo, um atacante espera a virada e dispara o dobro do limite de uma vez.
 */

export type RateLimitRule = {
  /** Quantas tentativas são toleradas dentro da janela. */
  readonly limit: number;
  /** Tamanho da janela, em segundos. */
  readonly windowSeconds: number;
};

export type RateLimitDecision = {
  readonly allowed: boolean;
  /** Segundos até liberar. Zero quando permitido. */
  readonly retryAfterSeconds: number;
  /** Tentativas ainda disponíveis na janela. */
  readonly remaining: number;
};

/**
 * Avalia se mais uma tentativa é permitida.
 *
 * `timestamps` são as tentativas *malsucedidas* anteriores, em qualquer ordem.
 * Tentativas fora da janela são ignoradas — é isso que faz a janela deslizar.
 */
export function evaluate(
  timestamps: readonly Date[],
  rule: RateLimitRule,
  now: Date = new Date(),
): RateLimitDecision {
  const windowStart = now.getTime() - rule.windowSeconds * 1000;
  const recent = timestamps
    .map((date) => date.getTime())
    .filter((time) => time > windowStart)
    .sort((a, b) => a - b);

  if (recent.length < rule.limit) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: rule.limit - recent.length,
    };
  }

  // A liberação acontece quando a tentativa mais antiga da janela sai dela.
  const oldest = recent[0] ?? now.getTime();
  const releaseAt = oldest + rule.windowSeconds * 1000;

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((releaseAt - now.getTime()) / 1000)),
    remaining: 0,
  };
}

/** Texto para o usuário. Fala em minutos quando a espera passa de um minuto. */
export function describeRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} segundos`;

  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? "1 minuto" : `${minutes} minutos`;
}

/**
 * Regras aplicadas.
 *
 * Duas dimensões, porque cada uma cobre um ataque diferente. Por conta, contra
 * força bruta em um alvo específico. Por IP, contra varredura de muitas contas
 * a partir da mesma origem — que passaria despercebida pelo limite por conta.
 *
 * O limite por IP é folgado de propósito: rede corporativa e operadora móvel
 * fazem muita gente compartilhar o mesmo endereço, e apertar demais bloquearia
 * usuário legítimo junto.
 */
export const RATE_LIMITS = {
  loginPerAccount: { limit: 5, windowSeconds: 15 * 60 },
  loginPerIp: { limit: 20, windowSeconds: 15 * 60 },
  registerPerIp: { limit: 5, windowSeconds: 60 * 60 },

  /**
   * Recuperação de senha tem orçamento PRÓPRIO, separado do login.
   *
   * Compartilhar a chave com o login criava uma armadilha: quem errasse a senha
   * até bater o limite ficava impedido de pedir a redefinição — exatamente no
   * momento em que mais precisa dela. O limite existe para conter disparo de
   * e-mail em massa, não para punir quem esqueceu a senha.
   */
  resetPerAccount: { limit: 3, windowSeconds: 60 * 60 },
  resetPerIp: { limit: 10, windowSeconds: 60 * 60 },
} as const satisfies Record<string, RateLimitRule>;
