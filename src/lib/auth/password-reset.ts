import "server-only";

import { randomBytes } from "node:crypto";

import { db } from "@/lib/db";
import { hmacKey } from "@/lib/security/crypto";

/**
 * Tokens de redefinição de senha.
 *
 * Decisões de segurança, todas com motivo:
 *
 * - **32 bytes de aleatoriedade criptográfica.** Adivinhar o token é a única
 *   forma de sequestrar o fluxo, então ele precisa ser grande e imprevisível.
 * - **Guardado como HMAC.** Um dump do banco não permite redefinir a senha de
 *   ninguém, pelo mesmo motivo de a senha ser hash. O HMAC (e não cifra) porque
 *   a busca é por igualdade exata.
 * - **Uma hora de validade.** Curto o bastante para limitar a janela de um
 *   e-mail vazado, longo o bastante para quem lê o e-mail mais tarde.
 * - **Uso único.** `usedAt` marca o consumo; token usado não vale de novo,
 *   mesmo dentro do prazo.
 * - **Emitir invalida os anteriores.** Pedir de novo cancela o link antigo, para
 *   que um pedido acidental não deixe dois links válidos circulando.
 */

const TOKEN_BYTES = 32;
const TTL_MINUTES = 60;

export const RESET_TTL_MINUTES = TTL_MINUTES;

/**
 * Emite um token e devolve o valor em claro — a única vez que ele existe fora
 * do e-mail. Quem chama deve enviá-lo e descartá-lo.
 */
export async function issueResetToken(userId: string): Promise<string> {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");

  await db.passwordResetToken.deleteMany({ where: { userId, usedAt: null } });

  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hmacKey(`reset:${token}`),
      expiresAt: new Date(Date.now() + TTL_MINUTES * 60 * 1000),
    },
  });

  return token;
}

export type ResetTokenCheck =
  | { readonly valid: true; readonly userId: string; readonly tokenId: string }
  | { readonly valid: false };

/** Confere um token sem consumi-lo. Usado para decidir se o formulário aparece. */
export async function checkResetToken(token: string): Promise<ResetTokenCheck> {
  if (!token) return { valid: false };

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hmacKey(`reset:${token}`) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { valid: false };
  }

  return { valid: true, userId: record.userId, tokenId: record.id };
}

/**
 * Consome o token e troca a senha, em uma transação.
 *
 * O `updateMany` com `usedAt: null` no filtro é o que impede uso duplo em
 * corrida: dois pedidos simultâneos com o mesmo token, e só o primeiro
 * encontra a linha ainda não usada.
 *
 * Trocar a senha **revoga todas as sessões**. Sem isso, quem tivesse invadido a
 * conta continuaria dentro depois de o dono legítimo redefinir a senha — que é
 * exatamente o cenário em que alguém redefine a senha.
 */
export async function consumeResetToken(
  tokenId: string,
  userId: string,
  passwordHash: string,
): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: tokenId, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });

    if (consumed.count === 0) return false;

    await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    await tx.session.deleteMany({ where: { userId } });

    return true;
  });
}

/** Expurga tokens expirados ou já usados. Retenção mínima, como o resto. */
export async function pruneResetTokens(): Promise<void> {
  await db.passwordResetToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
    },
  });
}
