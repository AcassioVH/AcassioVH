import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-2 text-2xl">Criar conta</h1>
      <p className="mb-8 text-sm text-blue-200">
        Você informa os ativos; nós organizamos e explicamos. Seus dados podem ser
        exportados ou excluídos a qualquer momento.
      </p>
      <RegisterForm />
    </>
  );
}
