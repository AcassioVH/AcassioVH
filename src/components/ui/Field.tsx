import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
};

/**
 * Campo de formulário.
 *
 * Sem cantos arredondados, como o resto do sistema: as superfícies são placas.
 * A mensagem de erro é ligada ao controle por `aria-describedby` e o campo ganha
 * `aria-invalid` — leitor de tela anuncia o problema junto com o campo, em vez
 * de o usuário descobrir que algo falhou só ao tentar enviar de novo.
 *
 * O erro usa o tom "atenção" do sistema, nunca vermelho puro, e vem sempre
 * acompanhado de texto.
 */
const CONTROL =
  "w-full border bg-inset px-4 py-3 text-base text-body placeholder:text-muted " +
  "transition-colors duration-200 focus:border-light focus:outline-none";

function Wrapper({
  label,
  name,
  error,
  hint,
  children,
}: BaseProps & { children: ReactNode }) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-tertiary"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="mt-2 text-sm leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-st-attention">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  name,
  error,
  hint,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint}>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={`${CONTROL} ${error ? "border-st-attention" : "border-edge"}`}
        {...props}
      />
    </Wrapper>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  children,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <Wrapper label={label} name={name} error={error} hint={hint}>
      <select
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={`${CONTROL} ${error ? "border-st-attention" : "border-edge"}`}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
}

export function SubmitButton({
  children,
  pending,
}: {
  children: ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-light px-6 py-3.5 text-base font-semibold text-[#060D10] transition-colors duration-200 hover:bg-[#F0D9B4] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Enviando…" : children}
    </button>
  );
}
