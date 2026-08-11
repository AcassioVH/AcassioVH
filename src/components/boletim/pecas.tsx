/**
 * As peças de um boletim.
 *
 * Separadas do orquestrador porque são a parte que não sabe nada sobre
 * apuração: recebem dados prontos e desenham. É o que permite ler
 * `Boletim.tsx` como um roteiro de etapas, sem 300 linhas de JSX no meio.
 *
 * Duas regras do sistema de marca aparecem aqui de forma não óbvia:
 *
 * - **Nada de verde nem vermelho na direção do indicador.** A versão original
 *   deste boletim pintava alta de verde e baixa de vermelho, que é exatamente
 *   o que a marca proíbe: verde lê "bom", vermelho lê "ruim", e o site não
 *   emite juízo. Aqui a direção é seta MAIS palavra, num tom só.
 * - **Estado é cor mais palavra.** `StatusPill` exige rótulo, e é ele que
 *   carrega o grau de confiança e o estágio de uma decisão pública.
 */

import type { ReactNode } from "react";

import { StatusPill } from "@/components/ui/StatusPill";
import type { Confianca, Direcao, Fonte } from "@/domain/boletim/tipos";

/** Frases que o modelo devolve quando o campo não se aplica. Não viram linha na tela. */
const VAZIO = /^(não se aplica|nao se aplica|não localizado|nao localizado|n\/a|-)$/i;

export function Campo({ rotulo, children }: { rotulo: string; children: string }) {
  if (children.trim().length === 0 || VAZIO.test(children.trim())) return null;

  return (
    <div className="mt-4">
      <p className="tech text-tertiary">{rotulo}</p>
      <p className="mt-1.5 text-base leading-relaxed text-body">{children}</p>
    </div>
  );
}

/**
 * As fontes de um item.
 *
 * Ficam sempre visíveis, e não atrás de um "ver fontes": a atribuição é a
 * única coisa que separa este boletim de um texto que afirma por conta
 * própria. Sem URL, o veículo aparece como texto — a busca nem sempre devolve
 * link, e omitir o veículo por isso seria perder a atribuição inteira.
 */
export function Fontes({ lista }: { lista: readonly Fonte[] }) {
  if (lista.length === 0) return null;

  return (
    <div className="mt-5 border-t border-edge-soft pt-4">
      <p className="tech text-tertiary">Fontes</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {lista.map((fonte, indice) => {
          const rotulo = fonte.data ? `${fonte.veiculo} · ${fonte.data}` : fonte.veiculo;

          return (
            <li key={`${fonte.veiculo}-${indice}`}>
              {fonte.url ? (
                <a
                  href={fonte.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block border border-edge px-3 py-1.5 font-mono text-xs text-aux underline decoration-edge underline-offset-4 transition-colors duration-300 hover:border-light hover:text-light"
                >
                  {rotulo}
                </a>
              ) : (
                <span className="block border border-edge-soft px-3 py-1.5 font-mono text-xs text-muted">
                  {rotulo}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Cartao({ children }: { children: ReactNode }) {
  return <article className="plate p-6 sm:p-7">{children}</article>;
}

export function TituloDeCartao({ children }: { children: string }) {
  return <h3 className="text-xl leading-snug sm:text-2xl">{children}</h3>;
}

/**
 * A direção de um indicador.
 *
 * Seta e palavra juntas, no mesmo tom do resto do texto auxiliar. A seta diz
 * o sentido depressa para quem varre a coluna com o olho; a palavra diz o
 * mesmo para quem usa leitor de tela ou não distingue a seta. Nenhuma cor
 * participa: sentido de movimento não é mérito.
 */
export function Movimento({ direcao, variacao }: { direcao: Direcao; variacao: string }) {
  const GLIFO: Record<Direcao, string> = { alta: "▲", baixa: "▼", estavel: "—" };
  const PALAVRA: Record<Direcao, string> = { alta: "alta", baixa: "baixa", estavel: "estável" };

  return (
    <span className="font-mono text-xs text-tertiary">
      <span aria-hidden="true">{GLIFO[direcao]}</span> {PALAVRA[direcao]}
      {variacao ? ` · ${variacao}` : ""}
    </span>
  );
}

const TOM_DE_CONFIANCA = {
  alta: "identified",
  media: "preparing",
  baixa: "attention",
} as const;

export function GrauDeConfianca({ confianca }: { confianca: Confianca }) {
  return (
    <StatusPill
      tone={TOM_DE_CONFIANCA[confianca]}
      label={`confiança ${confianca === "media" ? "média" : confianca}`}
    />
  );
}
