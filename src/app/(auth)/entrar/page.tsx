import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-2 text-2xl">Entrar</h1>
      <p className="mb-8 text-sm text-blue-200">Acesse a leitura da sua carteira.</p>
      <LoginForm />
    </>
  );
}
