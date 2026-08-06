"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, SubmitButton } from "@/components/ui/Field";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  type ResetPasswordState,
  type ResetRequestState,
} from "@/lib/auth/reset-actions";

function Notice({ message, tone = "attention" }: { message?: string; tone?: "attention" | "identified" }) {
  if (!message) return null;

  const cls =
    tone === "identified"
      ? "border-st-identified/45 bg-st-identified/[0.07] text-st-identified"
      : "border-st-attention/50 bg-st-attention/[0.07] text-st-attention";

  return (
    <p role="alert" className={`border px-4 py-3 text-sm ${cls}`}>
      {message}
    </p>
  );
}

const EMPTY_REQUEST: ResetRequestState = {};

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, EMPTY_REQUEST);

  /**
   * A confirmação é deliberadamente ambígua sobre a existência da conta.
   * Dizer "enviamos para o seu e-mail" sem confirmar que a conta existe é o que
   * impede usar este formulário para descobrir quem tem cadastro.
   */
  if (state.submitted) {
    return (
      <div className="space-y-6">
        <p className="text-base leading-relaxed text-body">
          Se existir uma conta com esse e-mail, enviamos as instruções para redefinir a
          senha. O link vale por 60 minutos.
        </p>
        <p className="text-sm leading-relaxed text-tertiary">
          Não chegou? Confira a caixa de spam. O e-mail vem de{" "}
          <span className="font-mono text-aux">nao-responda@acassium.com.br</span>.
        </p>
        <Link
          href="/entrar"
          className="inline-block border border-edge px-5 py-2.5 text-base text-body transition-colors duration-200 hover:border-light/60 hover:text-light"
        >
          Voltar para entrar
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <Notice message={state.message} />

      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.errors?.email}
        hint="Enviamos um link para você escolher uma senha nova."
      />

      <SubmitButton pending={pending}>Enviar link de redefinição</SubmitButton>

      <p className="text-center text-base text-tertiary">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="text-light underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

const EMPTY_RESET: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, EMPTY_RESET);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="token" value={token} />

      <Notice message={state.message} />

      <Field
        label="Nova senha"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.errors?.password}
        hint="Ao menos 12 caracteres. Comprimento protege mais que símbolos obrigatórios."
      />

      <Field
        label="Repita a nova senha"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        required
        error={state.errors?.passwordConfirmation}
      />

      <p className="text-sm leading-relaxed text-tertiary">
        Ao redefinir, todas as sessões abertas nesta conta são encerradas — inclusive em
        outros aparelhos.
      </p>

      <SubmitButton pending={pending}>Redefinir senha</SubmitButton>
    </form>
  );
}
