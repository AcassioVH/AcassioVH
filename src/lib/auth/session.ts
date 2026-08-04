import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

import { db } from "@/lib/db";

/**
 * Sessão por cookie assinado, com registro no banco.
 *
 * O cookie carrega um JWT curto que referencia uma linha em `sessions`. Os dois
 * juntos, e não só o JWT, porque token autocontido não se revoga: sem o
 * registro, um logout apagaria o cookie do navegador e deixaria uma cópia do
 * token válida até expirar. Com o registro, encerrar sessão ou excluir a conta
 * invalida de fato.
 *
 * O custo é uma consulta por requisição autenticada. `cache()` do React reduz
 * isso a uma consulta por render, mesmo que vários componentes peçam a sessão.
 */

const COOKIE_NAME = "acassium_session";
const SESSION_DURATION_DAYS = 14;
const ALGORITHM = "HS256";

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou curta demais (mínimo 32 caracteres). " +
        "Gere com: openssl rand -base64 32",
    );
  }

  return new TextEncoder().encode(secret);
}

function expiryDate(): Date {
  return new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

/** Cria a sessão no banco e grava o cookie assinado. */
export async function createSession(userId: string, userAgent?: string): Promise<void> {
  const expiresAt = expiryDate();

  const session = await db.session.create({
    data: { userId, expiresAt, userAgent: userAgent?.slice(0, 255) },
  });

  const token = await new SignJWT({ sid: session.id })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Sem `secure` em desenvolvimento o cookie não funcionaria em http://localhost.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export type SessionUser = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
};

/**
 * Usuário da requisição atual, ou `null`.
 *
 * Memoizada por render: chamar em layout, página e ação não multiplica idas ao
 * banco.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) return null;

  let sessionId: string;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALGORITHM] });
    if (typeof payload.sid !== "string") return null;
    sessionId = payload.sid;
  } catch {
    // Assinatura inválida ou token expirado: trata como anônimo, sem erro.
    return null;
  }

  const session = await db.session.findUnique({
    where: { id: sessionId },
    select: {
      expiresAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  // A expiração é conferida no banco também, e não só no JWT: é ela que permite
  // encerrar uma sessão antes do prazo do token.
  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
});

/** Encerra a sessão atual: apaga o registro e limpa o cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALGORITHM] });
      if (typeof payload.sid === "string") {
        // `deleteMany` não lança se a linha já sumiu — logout duplo não vira erro.
        await db.session.deleteMany({ where: { id: payload.sid } });
      }
    } catch {
      // Token ilegível: nada a revogar no banco, só limpar o cookie.
    }
  }

  store.delete(COOKIE_NAME);
}
