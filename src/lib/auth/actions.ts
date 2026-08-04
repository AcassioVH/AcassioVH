"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
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

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    // Aqui a enumeração de usuário é inevitável — não dá para cadastrar duas
    // contas com o mesmo e-mail sem dizer que ele já existe. O mitigador certo
    // é limitar tentativas por IP, anotado em docs/RISKS.md.
    return { errors: { email: "Já existe uma conta com esse e-mail." } };
  }

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

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  // Mesma mensagem para e-mail inexistente e senha errada: dizer qual dos dois
  // falhou entrega ao atacante a lista de e-mails cadastrados.
  const invalid: FormState = { message: "E-mail ou senha incorretos." };

  if (!user) {
    // Sem usuário não haveria hash a conferir, e a resposta voltaria na hora —
    // essa diferença de tempo, sozinha, revela quais e-mails existem. O hash
    // descartável abaixo iguala o custo dos dois caminhos.
    await hashPassword(password);
    return invalid;
  }

  if (!(await verifyPassword(user.passwordHash, password))) {
    return invalid;
  }

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
