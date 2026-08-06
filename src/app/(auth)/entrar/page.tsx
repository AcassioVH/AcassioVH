import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ senha?: string }>;
}) {
  const { senha } = await searchParams;

  return (
    <>
      <h1 className="mb-2 text-2xl">Entrar</h1>
      <p className="mb-8 text-base text-aux">Acesse a leitura da sua carteira.</p>
      <LoginForm passwordWasReset={senha === "redefinida"} />
    </>
  );
}
