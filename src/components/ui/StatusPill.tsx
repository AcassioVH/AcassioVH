/**
 * Rótulo de estado.
 *
 * O sistema de marca impõe duas regras aqui, e as duas estão codificadas neste
 * componente em vez de confiadas a quem for usá-lo:
 *
 * 1. **Cor mais palavra, nunca cor sozinha.** A `label` é obrigatória. Quem não
 *    distingue os matizes lê o texto e entende igual.
 * 2. **Sem verde no sistema.** Verde leria como "bom" e vermelho como "ruim", e
 *    o produto não emite juízo sobre ativo nenhum. Os matizes disponíveis são
 *    frios e âmbar: informam categoria, não mérito.
 *
 * Por isso o componente não aceita cor arbitrária — só os estados nomeados
 * abaixo. Precisar de um estado novo é motivo para revisar o sistema, não para
 * passar um hex por prop.
 */

export type StatusTone =
  | "identified"
  | "preparing"
  | "attention"
  | "missing"
  | "unavailable";

const TONE: Record<StatusTone, { color: string; border: string }> = {
  identified: { color: "var(--color-st-identified)", border: "rgba(143,188,194,.42)" },
  preparing: { color: "var(--color-st-preparing)", border: "rgba(148,167,196,.42)" },
  attention: { color: "var(--color-st-attention)", border: "rgba(208,138,95,.42)" },
  missing: { color: "var(--color-st-missing)", border: "rgba(217,119,108,.42)" },
  unavailable: { color: "var(--color-st-unavailable)", border: "var(--color-edge)" },
};

export function StatusPill({
  tone,
  label,
  className = "",
}: {
  tone: StatusTone;
  /** Obrigatório: o estado nunca é comunicado só por cor. */
  label: string;
  className?: string;
}) {
  const { color, border } = TONE[tone];

  return (
    <span
      className={`tech inline-block whitespace-nowrap px-3 py-1.5 ${className}`}
      style={{ color, border: `1px solid ${border}`, letterSpacing: "0.12em" }}
    >
      {label}
    </span>
  );
}
