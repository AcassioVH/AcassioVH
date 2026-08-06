import "server-only";

import { headers } from "next/headers";

import { db } from "@/lib/db";
import { hmacKey } from "@/lib/security/crypto";
import {
  describeRetryAfter,
  evaluate,
  type RateLimitDecision,
  type RateLimitRule,
} from "./rate-limit-policy";

/**
 * Limite de tentativas, com contagem no Postgres.
 *
 * A camada de persistência é fina de propósito: toda a decisão está na função
 * pura de `rate-limit-policy.ts`. Aqui só lemos os instantes das tentativas
 * recentes e gravamos as novas.
 */

/**
 * Chaves do limite, já com namespace e passadas por HMAC.
 *
 * O namespace evita que um e-mail colida com um IP. O HMAC tira e-mail e IP
 * legíveis do banco sem perder a consulta por igualdade exata — cifrar não
 * serviria aqui, porque o IV aleatório impediria reencontrar a linha.
 */
export const rateLimitKeys = {
  loginAccount: (email: string) => hmacKey(`login:conta:${email.trim().toLowerCase()}`),
  loginIp: (ip: string) => hmacKey(`login:ip:${ip}`),
  registerIp: (ip: string) => hmacKey(`cadastro:ip:${ip}`),
  resetAccount: (email: string) => hmacKey(`reset:conta:${email.trim().toLowerCase()}`),
  resetIp: (ip: string) => hmacKey(`reset:ip:${ip}`),
} as const;

/**
 * IP do cliente, a partir dos cabeçalhos do proxy.
 *
 * ATENÇÃO: `x-forwarded-for` é forjável por quem fala direto com a aplicação.
 * Isto só é confiável porque em produção o tráfego entra pelo proxy da Vercel,
 * que reescreve o cabeçalho. Ao migrar para outra hospedagem, confirme que o
 * proxy faz o mesmo — caso contrário o limite por IP vira decorativo.
 *
 * O primeiro endereço da lista é o cliente original; os seguintes são proxies.
 */
export async function clientIp(): Promise<string> {
  const headerList = await headers();

  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return headerList.get("x-real-ip")?.trim() || "desconhecido";
}

/** Consulta o limite sem registrar tentativa. */
export async function checkRateLimit(
  key: string,
  rule: RateLimitRule,
): Promise<RateLimitDecision> {
  const since = new Date(Date.now() - rule.windowSeconds * 1000);

  const attempts = await db.authAttempt.findMany({
    where: { key, createdAt: { gt: since } },
    select: { createdAt: true },
    // Sem teto, uma rajada grande faria a consulta carregar milhares de linhas.
    // Passando do limite a decisão já está tomada, então basta o suficiente
    // para contar e achar a mais antiga.
    take: rule.limit + 1,
    orderBy: { createdAt: "asc" },
  });

  return evaluate(
    attempts.map((attempt) => attempt.createdAt),
    rule,
  );
}

/** Registra uma tentativa malsucedida. */
export async function recordFailedAttempt(key: string): Promise<void> {
  await db.authAttempt.create({ data: { key } });
}

/**
 * Limpa as tentativas de uma chave.
 *
 * Chamada depois de um login bem-sucedido: quem errou a senha três vezes e
 * acertou na quarta não deve continuar a um passo do bloqueio.
 */
export async function clearAttempts(key: string): Promise<void> {
  await db.authAttempt.deleteMany({ where: { key } });
}

/**
 * Expurga tentativas fora de qualquer janela.
 *
 * Roda oportunisticamente junto ao registro de falhas, em vez de exigir um cron:
 * a tabela guarda e-mail, que é dado pessoal, e retenção mínima é requisito de
 * LGPD — não só higiene de banco.
 */
export async function pruneExpiredAttempts(maxWindowSeconds: number): Promise<void> {
  const cutoff = new Date(Date.now() - maxWindowSeconds * 1000);
  await db.authAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } });
}

export { describeRetryAfter };
