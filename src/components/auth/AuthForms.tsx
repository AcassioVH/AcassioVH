"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, SubmitButton } from "@/components/ui/Field";
import { loginAction, registerAction, type FormState } from "@/lib/auth/actions";

const EMPTY: FormState = {};

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold"
    >
      {message}
    </p>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, EMPTY);

  return (
    <form action={action} className="space-y-6">
      <FormError message={state.message} />

      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.errors?.email}
      />
      <Field
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.errors?.password}
      />

      <SubmitButton pending={pending}>Entrar</SubmitButton>

      <p className="text-center text-sm text-blue-200">
        Ainda não tem conta?{" "}
        <Link href="/criar-conta" className="text-gold underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, EMPTY);

  return (
    <form action={action} className="space-y-6">
      <FormError message={state.message} />

      <Field label="Nome" name="name" autoComplete="name" required error={state.errors?.name} />
      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.errors?.email}
      />
      <Field
        label="Senha"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.errors?.password}
        hint="Ao menos 12 caracteres. Comprimento protege mais que símbolos obrigatórios."
      />

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-blue-200">
          <input
            type="checkbox"
            name="acceptedTerms"
            className="mt-1 size-4 shrink-0 accent-[#c9a24b]"
            aria-describedby={state.errors?.acceptedTerms ? "terms-error" : undefined}
          />
          <span>
            Li e aceito os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="text-gold underline underline-offset-4"
            >
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              className="text-gold underline underline-offset-4"
            >
              Política de Privacidade
            </Link>
            . Entendo que a Acássium Invest organiza e descreve a carteira que eu
            informar, e que não faz recomendação de investimento.
          </span>
        </label>
        {state.errors?.acceptedTerms ? (
          <p id="terms-error" role="alert" className="mt-2 text-xs text-gold">
            {state.errors.acceptedTerms}
          </p>
        ) : null}
      </div>

      <SubmitButton pending={pending}>Criar conta</SubmitButton>

      <p className="text-center text-sm text-blue-200">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-gold underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
