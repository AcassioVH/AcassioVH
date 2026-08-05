"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { RATE_LIMITS } from "@/lib/security/rate-limit-policy";
import {
  checkRateLimit,
  clearAttempts,
  clientIp,
  describeRetryAfter,
  pruneExpiredAttempts,
  rateLimitKeys,
  recordFailedAttempt,
} from "@/lib/security/rate-limit";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validation";

export type FormState = {
  readonly errors?: Record<string, string>;
  readonly message?: string;
};

async function currentUserAgent(): Promise<string | undefined> {
  const headerList = await headers();
  return headerList.get("user-agent") ?? undefined;
}

export async function registerAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    acceptedTerms: formData.get("acceptedTerms") ?? undefined,
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { name, email, password } = parsed.data;

  const ip = await clientIp();
  const ipKey = rateLimitKeys.registerIp(ip);

  const decision = await checkRateLimit(ipKey, RATE_LIMITS.registerPerIp);
  if (!decision.allowed) {
    return {
      message:
        "Muitas tentativas de cadastro a partir deste acesso. Tente novamente em " +
        `${describeRetryAfter(decision.retryAfterSeconds)}.`,
    };
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    // Aqui a enumeração é inevitável: não dá para recusar conta duplicada sem
    // revelar que o e-mail já existe. Por isso a tentativa é contabilizada —
    // é o limite por IP que impede transformar este formulário em uma sonda
    // para descobrir quem tem conta.
    await recordFailedAttempt(ipKey);
    return { errors: { email: "Já existe uma conta com esse e-mail." } };
  }

  // Cadastro concluído também conta para o limite por IP: sem isso, criar
  // contas em massa passaria livre, já que nenhuma delas seria uma "falha".
  await recordFailedAttempt(ipKey);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      termsAcceptedAt: new Date(),
    },
    select: { id: true },
  });

  await createSession(user.id, await currentUserAgent());
  redirect("/carteira");
}

export async function loginAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { email, password } = parsed.data;

  const ip = await clientIp();
  const accountKey = rateLimitKeys.loginAccount(email);
  const ipKey = rateLimitKeys.loginIp(ip);

  // A checagem vem antes de qualquer argon2: verificar hash custa ~50ms de CPU
  // de propósito, e deixar isso acessível sem limite transformaria o login em
  // vetor de exaustão de recursos.
  const [byAccount, byIp] = await Promise.all([
    checkRateLimit(accountKey, RATE_LIMITS.loginPerAccount),
    checkRateLimit(ipKey, RATE_LIMITS.loginPerIp),
  ]);

  const blocked = !byAccount.allowed ? byAccount : !byIp.allowed ? byIp : null;

  if (blocked) {
    return {
      message:
        "Muitas tentativas de acesso. Tente novamente em " +
        `${describeRetryAfter(blocked.retryAfterSeconds)}.`,
    };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  // Mesma mensagem para e-mail inexistente e senha errada: dizer qual dos dois
  // falhou entrega ao atacante a lista de e-mails cadastrados.
  const invalid: FormState = { message: "E-mail ou senha incorretos." };

  /**
   * Contabiliza a falha nas duas dimensões.
   *
   * Também para e-mail inexistente, e isso é essencial: se só contássemos
   * falhas de contas reais, o bloqueio apareceria apenas para e-mails
   * cadastrados — e o próprio limite viraria o oráculo de enumeração que a
   * mensagem única existe para evitar.
   */
  const registerFailure = async () => {
    await Promise.all([recordFailedAttempt(accountKey), recordFailedAttempt(ipKey)]);
    // Aproveita a escrita para expurgar o que já saiu de qualquer janela.
    await pruneExpiredAttempts(RATE_LIMITS.registerPerIp.windowSeconds);
  };

  if (!user) {
    // Sem usuário não haveria hash a conferir, e a resposta voltaria na hora —
    // essa diferença de tempo, sozinha, revela quais e-mails existem. O hash
    // descartável abaixo iguala o custo dos dois caminhos.
    await hashPassword(password);
    await registerFailure();
    return invalid;
  }

  if (!(await verifyPassword(user.passwordHash, password))) {
    await registerFailure();
    return invalid;
  }

  // Quem errou três vezes e acertou na quarta não deve seguir a um passo do
  // bloqueio. O contador por IP permanece: ele protege contra varredura de
  // várias contas, e um acerto isolado não desmente isso.
  await clearAttempts(accountKey);

  await createSession(user.id, await currentUserAgent());
  redirect("/carteira");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

/**
 * Exclusão de conta — LGPD art. 18, direito à eliminação.
 *
 * O `onDelete: Cascade` do schema faz o trabalho: apagar `User` leva junto
 * sessões e ativos, em uma transação só. Não há varredura manual por tabela,
 * que é exatamente onde o dado esquecido costuma sobreviver.
 */
export async function deleteAccountAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  await db.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect("/?conta=excluida");
}
