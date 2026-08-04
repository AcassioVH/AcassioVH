/**
 * Aviso legal.
 *
 * Exigência regulatória, então é um componente e não uma string copiada: toda
 * tela relevante usa o mesmo texto, vindo da política, e uma revisão jurídica
 * futura muda tudo em um lugar só.
 */

import { DISCLAIMER_FULL, DISCLAIMER_SHORT } from "@/domain/compliance/policy";

type DisclaimerProps = {
  variant?: "short" | "full";
  className?: string;
};

export function Disclaimer({ variant = "short", className = "" }: DisclaimerProps) {
  const text = variant === "full" ? DISCLAIMER_FULL : DISCLAIMER_SHORT;

  return (
    <p
      role="note"
      className={`text-xs leading-relaxed text-blue-200/70 ${className}`}
    >
      {text}
    </p>
  );
}

/** Faixa fixa de aviso, para telas de carteira e dashboard. */
export function DisclaimerBar() {
  return (
    <div className="border-t border-blue/30 bg-navy-800/80 px-6 py-3 backdrop-blur">
      <Disclaimer variant="short" className="mx-auto max-w-6xl text-center" />
    </div>
  );
}
