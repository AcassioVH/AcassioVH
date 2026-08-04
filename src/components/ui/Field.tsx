import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
};

const controlClasses =
  "w-full rounded-xl border bg-navy-800/60 px-4 py-3 text-base text-mist " +
  "placeholder:text-blue-200/40 transition-colors duration-200 " +
  "focus:border-gold focus:outline-none";

/**
 * Campo de formulário.
 *
 * A mensagem de erro é ligada ao controle por `aria-describedby` e o campo
 * ganha `aria-invalid`: leitor de tela anuncia o problema junto com o campo,
 * em vez de o usuário descobrir que algo falhou só ao tentar enviar de novo.
 */
export function Field({
  label,
  name,
  error,
  hint,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-mist">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`${controlClasses} ${error ? "border-gold" : "border-blue/40"}`}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="mt-2 text-xs text-blue-200/70">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-gold">
          {error}
        </p>
      ) : null}
    </div>
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
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-mist">
        {label}
      </label>
      <select
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`${controlClasses} ${error ? "border-gold" : "border-blue/40"}`}
        {...props}
      >
        {children}
      </select>
      {hint && !error ? (
        <p id={hintId} className="mt-2 text-xs text-blue-200/70">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-gold">
          {error}
        </p>
      ) : null}
    </div>
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
      className="w-full rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-navy transition-colors duration-300 hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Enviando…" : children}
    </button>
  );
}
