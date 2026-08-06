/**
 * A marca de garantia — a pergunta que o visitante mais faz.
 *
 * "Tem FGC?" é a primeira coisa que se quer saber de um produto de renda fixa, e
 * a resposta é factual: ou o instrumento está na lista coberta pelo Fundo
 * Garantidor de Créditos, ou não está.
 *
 * Duas regras da marca valem exatamente aqui, onde a tentação de usar verde e
 * vermelho é maior: **não há verde no sistema**, porque verde diria "seguro" e
 * vermelho diria "arriscado" — e ter ou não cobertura do FGC não torna um
 * produto bom ou ruim, só descreve uma estrutura diferente. E **o estado é cor
 * mais palavra**: quem não distingue os matizes lê o texto e entende igual.
 */

import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";
import type { GuaranteeKind } from "@/domain/assets/profile-types";

const MARK: Record<GuaranteeKind, { label: string; tone: StatusTone }> = {
  FGC: { label: "COBERTO PELO FGC", tone: "identified" },
  TESOURO_NACIONAL: { label: "TESOURO NACIONAL", tone: "preparing" },
  GARANTIA_REAL: { label: "GARANTIA DA EMISSÃO", tone: "attention" },
  SEM_GARANTIA_ESPECIFICA: { label: "SEM COBERTURA DO FGC", tone: "unavailable" },
};

export function GuaranteeMark({ kind, className }: { kind: GuaranteeKind; className?: string }) {
  const mark = MARK[kind];
  return <StatusPill tone={mark.tone} label={mark.label} className={className} />;
}

/** A mesma informação em texto corrido, para quando o pill não couber. */
export function guaranteeLabel(kind: GuaranteeKind): string {
  return MARK[kind].label;
}
