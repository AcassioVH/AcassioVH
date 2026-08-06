"use server";

import { redirect } from "next/navigation";

import { site } from "@/config/site";
import { sendEmail } from "@/lib/email/mailer";
import { hashPassword } from "@/lib/auth/password";
import {
  RESET_TTL_MINUTES,
  checkResetToken,
  consumeResetToken,
  issueResetToken,
  pruneResetTokens,
} from "@/lib/auth/password-reset";
import { db } from "@/lib/db";
import { RATE_LIMITS } from "@/lib/security/rate-limit-policy";
import {
  checkRateLimit,
  clientIp,
  describeRetryAfter,
  rateLimitKeys,
  recordFailedAttempt,
} from "@/lib/security/rate-limit";
import { emailSchema, fieldErrors, passwordSchema } from "@/lib/validation";

export type ResetRequestState = {
  readonly errors?: Record<string, string>;
  readonly message?: string;
  /** True quando o pedido foi aceito — a tela troca para a confirmação. */
  readonly submitted?: boolean;
};

/**
 * Pedido de redefinição.
 *
 * A resposta é **sempre a mesma**, exista ou não a conta. Dizer "não há conta
 * com esse e-mail" transformaria este formulário — que é público e não exige
 * autenticação — no oráculo de enumeração mais fácil do sistema, justamente o
 * que a mensagem única do login existe para evitar.
 */
export async function requestPasswordResetAction(
  _previous: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    return { errors: { email: "Informe um e-mail válido." } };
  }

  const email = parsed.data;
  const ip = await clientIp();
  // Chaves próprias, separadas das do login. Compartilhá-las bloquearia o
  // pedido de redefinição justamente para quem errou a senha várias vezes —
  // ou seja, para quem mais precisa dele.
  const ipKey = rateLimitKeys.resetIp(ip);
  const accountKey = rateLimitKeys.resetAccount(email);

  // Sem limite, este formulário viraria uma máquina de disparar e-mail para
  // terceiros — o endereço é escolhido por quem envia, não pelo dono da conta.
  const [byIp, byAccount] = await Promise.all([
    checkRateLimit(ipKey, RATE_LIMITS.resetPerIp),
    checkRateLimit(accountKey, RATE_LIMITS.resetPerAccount),
  ]);

  const blocked = !byIp.allowed ? byIp : !byAccount.allowed ? byAccount : null;
  if (blocked) {
    return {
      message:
        "Muitos pedidos a partir deste acesso. Tente novamente em " +
        `${describeRetryAfter(blocked.retryAfterSeconds)}.`,
    };
  }

  await Promise.all([recordFailedAttempt(ipKey), recordFailedAttempt(accountKey)]);

  const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });

  if (user) {
    const token = await issueResetToken(user.id);
    const url = `${site.url}/redefinir-senha?token=${encodeURIComponent(token)}`;

    await sendEmail({
      to: email,
      subject: "Redefinir a sua senha — Acássium Invest",
      text: [
        `Olá, ${user.name}.`,
        "",
        "Recebemos um pedido para redefinir a senha da sua conta na Acássium Invest.",
        "Abra o endereço abaixo para escolher uma senha nova:",
        "",
        url,
        "",
        `O link vale por ${RESET_TTL_MINUTES} minutos e só pode ser usado uma vez.`,
        "Ao redefinir a senha, todas as sessões abertas são encerradas.",
        "",
        "Se não foi você que pediu, ignore esta mensagem: a senha atual continua valendo",
        "e nada muda na sua conta.",
        "",
        "— Acássium Invest",
        "Conteúdo meramente informativo. Não constitui recomendação de investimento.",
      ].join("\n"),
    });

    await pruneResetTokens();
  }

  return { submitted: true };
}

export type ResetPasswordState = {
  readonly errors?: Record<string, string>;
  readonly message?: string;
};

/** Conclui a redefinição: valida o token, troca a senha e encerra as sessões. */
export async function resetPasswordAction(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = formData.get("token");
  const parsed = passwordSchema.safeParse(formData.get("password"));

  if (typeof token !== "string" || token === "") {
    return { message: "Link inválido. Peça um novo e-mail de redefinição." };
  }

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const confirmation = formData.get("passwordConfirmation");
  if (confirmation !== parsed.data) {
    return { errors: { passwordConfirmation: "As senhas não conferem." } };
  }

  const check = await checkResetToken(token);
  if (!check.valid) {
    return {
      message:
        "Este link expirou ou já foi usado. Peça um novo e-mail de redefinição.",
    };
  }

  const changed = await consumeResetToken(
    check.tokenId,
    check.userId,
    await hashPassword(parsed.data),
  );

  if (!changed) {
    return {
      message: "Este link expirou ou já foi usado. Peça um novo e-mail de redefinição.",
    };
  }

  redirect("/entrar?senha=redefinida");
}
