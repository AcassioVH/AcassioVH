import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.FIELD_ENCRYPTION_KEY = Buffer.alloc(32, 11).toString("base64");
});

const { hmacKey } = await import("../src/lib/security/crypto");
const { RATE_LIMITS, evaluate } = await import("../src/lib/security/rate-limit-policy");

/**
 * O ciclo completo de redefinição é verificado no navegador, contra Postgres
 * real — token emitido, e-mail entregue, link consumido, sessões revogadas.
 * Aqui ficam as propriedades que dá para travar sem banco.
 */

describe("token de redefinição", () => {
  it("o hash guardado não permite reconstruir o token", () => {
    const token = "7e-YEC5rtfm0ZFIpWDXRYzz_rhulHlO3auWj6aZ6W28";
    const stored = hmacKey(`reset:${token}`);

    expect(stored).not.toContain(token);
    expect(stored.length).toBeLessThan(token.length + 20);
  });

  it("é determinístico, para permitir a busca por igualdade", () => {
    expect(hmacKey("reset:abc")).toBe(hmacKey("reset:abc"));
  });

  it("separa o namespace de redefinição do de limite de tentativas", () => {
    // Sem o prefixo, um token e uma chave de contador poderiam colidir.
    expect(hmacKey("reset:abc")).not.toBe(hmacKey("login:conta:abc"));
  });
});

describe("limite de pedidos de redefinição", () => {
  it("tem orçamento próprio, separado do login", () => {
    // Compartilhar a chave criava uma armadilha: quem errava a senha até bater
    // o limite ficava impedido de pedir a redefinição — exatamente quem mais
    // precisa dela.
    expect(RATE_LIMITS.resetPerAccount).not.toEqual(RATE_LIMITS.loginPerAccount);
    expect(RATE_LIMITS.resetPerIp).not.toEqual(RATE_LIMITS.loginPerIp);
  });

  it("é mais apertado por conta que por IP", () => {
    expect(RATE_LIMITS.resetPerAccount.limit).toBeLessThan(RATE_LIMITS.resetPerIp.limit);
  });

  it("bloqueia disparo em massa para o mesmo endereço", () => {
    const now = new Date("2026-08-06T12:00:00Z");
    const attempts = Array.from(
      { length: RATE_LIMITS.resetPerAccount.limit },
      (_, i) => new Date(now.getTime() - i * 1000),
    );

    expect(evaluate(attempts, RATE_LIMITS.resetPerAccount, now).allowed).toBe(false);
  });

  it("libera depois da janela", () => {
    const now = new Date("2026-08-06T12:00:00Z");
    const old = new Date(now.getTime() - (RATE_LIMITS.resetPerAccount.windowSeconds + 60) * 1000);
    const attempts = Array.from({ length: 10 }, () => old);

    expect(evaluate(attempts, RATE_LIMITS.resetPerAccount, now).allowed).toBe(true);
  });
});
