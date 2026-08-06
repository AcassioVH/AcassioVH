import type { Metadata } from "next";

import { RequestResetForm } from "@/components/auth/ResetForms";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RequestResetPage() {
  return (
    <>
      <h1 className="mb-2 text-2xl">Recuperar senha</h1>
      <p className="mb-8 text-base text-aux">
        Informe o e-mail da sua conta. Enviamos um link para você escolher uma senha nova.
      </p>
      <RequestResetForm />
    </>
  );
}
