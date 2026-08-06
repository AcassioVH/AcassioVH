import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/ResetForms";
import { checkResetToken } from "@/lib/auth/password-reset";

export const metadata: Metadata = { title: "Redefinir senha" };

/**
 * Tela de escolha da nova senha.
 *
 * O token é conferido no servidor antes de o formulário aparecer: link expirado
 * mostra o motivo e o caminho de volta, em vez de deixar o usuário preencher
 * duas senhas para só então descobrir que não valia.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const check = token ? await checkResetToken(token) : { valid: false as const };

  if (!check.valid || !token) {
    return (
      <>
        <h1 className="mb-2 text-2xl">Link inválido</h1>
        <p className="mb-8 text-base leading-relaxed text-aux">
          Este link de redefinição expirou, já foi usado ou não é válido. Cada link vale
          por 60 minutos e serve uma única vez.
        </p>
        <Link
          href="/recuperar-senha"
          className="inline-block bg-light px-6 py-3 text-base font-semibold text-[#060D10] transition-colors duration-200 hover:bg-[#F0D9B4]"
        >
          Pedir um novo link
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-2xl">Escolha uma senha nova</h1>
      <p className="mb-8 text-base text-aux">
        Depois de redefinir, você entra com a senha nova.
      </p>
      <ResetPasswordForm token={token} />
    </>
  );
}
