import { describe, expect, it } from "vitest";

import {
  RATE_LIMITS,
  describeRetryAfter,
  evaluate,
  type RateLimitRule,
} from "../src/lib/security/rate-limit-policy";

const NOW = new Date("2026-08-04T12:00:00.000Z");
const RULE: RateLimitRule = { limit: 3, windowSeconds: 60 };

/** Instante a N segundos atrás de NOW. */
function secondsAgo(seconds: number): Date {
  return new Date(NOW.getTime() - seconds * 1000);
}

describe("janela deslizante", () => {
  it("permite quando não há tentativa alguma", () => {
    const decision = evaluate([], RULE, NOW);
    expect(decision.allowed).toBe(true);
    expect(decision.remaining).toBe(3);
    expect(decision.retryAfterSeconds).toBe(0);
  });

  it("permite enquanto estiver abaixo do limite", () => {
    const decision = evaluate([secondsAgo(10), secondsAgo(5)], RULE, NOW);
    expect(decision.allowed).toBe(true);
    expect(decision.remaining).toBe(1);
  });

  it("bloqueia ao atingir o limite", () => {
    const decision = evaluate([secondsAgo(30), secondsAgo(20), secondsAgo(10)], RULE, NOW);
    expect(decision.allowed).toBe(false);
    expect(decision.remaining).toBe(0);
  });

  it("ignora tentativas que já saíram da janela", () => {
    // Três tentativas antigas não contam; só a recente está na janela.
    const decision = evaluate(
      [secondsAgo(120), secondsAgo(90), secondsAgo(61), secondsAgo(5)],
      RULE,
      NOW,
    );
    expect(decision.allowed).toBe(true);
    expect(decision.remaining).toBe(2);
  });

  it("libera parcialmente conforme a janela desliza", () => {
    // Duas tentativas saíram; uma permanece. Deve sobrar espaço para duas.
    const decision = evaluate(
      [secondsAgo(70), secondsAgo(65), secondsAgo(30)],
      RULE,
      NOW,
    );
    expect(decision.allowed).toBe(true);
    expect(decision.remaining).toBe(2);
  });

  it("conta a tentativa exatamente na borda da janela como expirada", () => {
    // Em `windowSeconds` cravados, a tentativa já saiu — o filtro é estrito.
    const decision = evaluate(
      [secondsAgo(60), secondsAgo(59), secondsAgo(58)],
      RULE,
      NOW,
    );
    expect(decision.allowed).toBe(true);
    expect(decision.remaining).toBe(1);
  });

  it("não depende da ordem em que as tentativas chegam", () => {
    const desordenado = evaluate(
      [secondsAgo(10), secondsAgo(50), secondsAgo(30)],
      RULE,
      NOW,
    );
    const ordenado = evaluate(
      [secondsAgo(50), secondsAgo(30), secondsAgo(10)],
      RULE,
      NOW,
    );
    expect(desordenado).toEqual(ordenado);
  });
});

describe("tempo de espera", () => {
  it("conta a partir da tentativa mais antiga da janela", () => {
    // A mais antiga foi há 50s; ela sai da janela de 60s em 10s.
    const decision = evaluate(
      [secondsAgo(50), secondsAgo(20), secondsAgo(10)],
      RULE,
      NOW,
    );
    expect(decision.allowed).toBe(false);
    expect(decision.retryAfterSeconds).toBe(10);
  });

  it("nunca devolve zero enquanto estiver bloqueado", () => {
    // Mesmo com a mais antiga prestes a expirar, a espera arredonda para 1s —
    // devolver 0 diria ao usuário "tente já" e ele bateria no bloqueio de novo.
    const decision = evaluate(
      [new Date(NOW.getTime() - 59_999), secondsAgo(20), secondsAgo(10)],
      RULE,
      NOW,
    );
    expect(decision.allowed).toBe(false);
    expect(decision.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("mede a espera pela tentativa mais antiga, não pela mais recente", () => {
    // Tentativas extras dentro da janela não empurram a liberação para frente:
    // quem manda é a mais antiga, que é quem sai primeiro.
    //
    // Na prática isso nem chega a ser exercitado, porque a ação de login não
    // registra tentativa já bloqueada — martelar durante o bloqueio não
    // prolonga o castigo. É comportamento desejado: prolongar permitiria que
    // um terceiro mantivesse a conta de outra pessoa travada indefinidamente.
    const semInsistir = evaluate(
      [secondsAgo(55), secondsAgo(54), secondsAgo(53)],
      RULE,
      NOW,
    );
    const insistindo = evaluate(
      [secondsAgo(55), secondsAgo(54), secondsAgo(53), secondsAgo(1)],
      RULE,
      NOW,
    );

    expect(semInsistir.allowed).toBe(false);
    expect(insistindo.allowed).toBe(false);
    expect(insistindo.retryAfterSeconds).toBe(semInsistir.retryAfterSeconds);
  });

  it("libera assim que a janela das tentativas antigas passa", () => {
    const antes = evaluate([secondsAgo(55), secondsAgo(54), secondsAgo(53)], RULE, NOW);
    const depois = evaluate(
      [secondsAgo(55), secondsAgo(54), secondsAgo(53)],
      RULE,
      new Date(NOW.getTime() + 10_000),
    );

    expect(antes.allowed).toBe(false);
    expect(depois.allowed).toBe(true);
    expect(depois.remaining).toBe(3);
  });

  it("descreve a espera em português legível", () => {
    expect(describeRetryAfter(30)).toBe("30 segundos");
    expect(describeRetryAfter(60)).toBe("1 minuto");
    expect(describeRetryAfter(61)).toBe("2 minutos");
    expect(describeRetryAfter(900)).toBe("15 minutos");
  });
});

describe("regras configuradas", () => {
  it("limita a conta antes do IP, para não punir rede compartilhada", () => {
    // Operadora móvel e rede corporativa fazem muita gente dividir o mesmo IP;
    // o teto por IP precisa ser bem mais folgado que o por conta.
    expect(RATE_LIMITS.loginPerIp.limit).toBeGreaterThan(
      RATE_LIMITS.loginPerAccount.limit,
    );
  });

  it("usa janelas de duração razoável", () => {
    for (const rule of Object.values(RATE_LIMITS)) {
      expect(rule.limit).toBeGreaterThan(0);
      expect(rule.windowSeconds).toBeGreaterThanOrEqual(60);
    }
  });
});
