import { DISCLAIMER_FULL, DISCLAIMER_SHORT } from "@/domain/compliance/policy";

/**
 * Aviso legal.
 *
 * Exigência regulatória, então é componente e não string copiada: toda tela
 * relevante usa o mesmo texto, vindo da política, e uma revisão jurídica futura
 * muda tudo em um lugar só.
 */
export function Disclaimer({
  variant = "short",
  className = "",
}: {
  variant?: "short" | "full";
  className?: string;
}) {
  return (
    <p role="note" className={`text-sm leading-relaxed text-tertiary ${className}`}>
      {variant === "full" ? DISCLAIMER_FULL : DISCLAIMER_SHORT}
    </p>
  );
}

/**
 * Faixa de rodapé das telas de carteira.
 *
 * Em mono e caixa alta porque, no sistema, tudo que é metadado do serviço fala
 * nessa voz — o aviso é condição de operação, não conteúdo.
 */
export function DisclaimerBar() {
  return (
    <div className="border-t border-edge-soft bg-abyss px-6 py-4 sm:px-10">
      <p className="mx-auto max-w-6xl font-mono text-[11px] leading-relaxed tracking-wide text-muted">
        Conteúdo descritivo baseado em registros públicos. A Acássium não avalia, classifica
        nem compara ativos, e não sugere realocação.
      </p>
    </div>
  );
}
