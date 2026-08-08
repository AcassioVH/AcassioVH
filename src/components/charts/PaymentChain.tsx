"use client";

/**
 * O caminho do seu dinheiro, desenhado — e percorrido.
 *
 * Cada família de produto tem um caminho: de você até onde o dinheiro para, e
 * por quantas mãos ele passa no meio. Ver "Você → Securitizadora → Devedores dos
 * recebíveis" ao lado de "Você → Tesouro Nacional" ensina, num olhar, a
 * diferença que três parágrafos não fixam.
 *
 * **A direção era a inversa.** O diagrama começava no pagador final e terminava
 * em "Você", o que é verdade sobre o pagamento e é a ordem errada para quem lê:
 * quem chega numa página de investimento pensa primeiro no dinheiro que sai da
 * mão dele. Começando por "Você", o leitor se encontra no primeiro elo — que é
 * onde ele de fato está quando decide.
 *
 * **Por que o diagrama se move.** A versão parada mostrava a topologia e não a
 * direção: um leitor podia ler os elos da direita para a esquerda sem perceber.
 * Quando um pulso de luz atravessa a cadeia na ordem certa, o sentido do
 * caminho deixa de depender da seta e passa a ser visto. O movimento aqui não
 * é enfeite — é a informação que faltava.
 *
 * **É estrutura, nunca mérito.** Mais elos não significa pior, e o pulso não
 * corre mais rápido em cadeia nenhuma. Só o primeiro nó, que é você, tem
 * contorno: é orientação, não avaliação.
 *
 * Dispara uma vez ao entrar na tela e não repete: animação em laço no meio de um
 * texto de leitura vira ruído periférico. Sob `prefers-reduced-motion` o
 * diagrama nasce completo, e continua legível — que é o teste de um efeito bem
 * escolhido.
 */

import { motion, useReducedMotion } from "motion/react";

export function PaymentChain({
  chain,
  accent = "var(--color-light)",
  className = "",
}: {
  chain: readonly string[];
  accent?: string;
  className?: string;
}) {
  const parado = useReducedMotion();

  // O pulso leva o mesmo tempo por elo em qualquer cadeia: velocidade constante
  // é o que impede a leitura de "esta paga mais rápido".
  const porElo = 0.42;

  return (
    <motion.ol
      className={`flex flex-col gap-0 sm:flex-row sm:flex-wrap sm:items-stretch ${className}`}
      aria-label="Caminho do seu dinheiro"
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.6 }}
    >
      {chain.map((node, index) => {
        // "Você" é o primeiro elo desde que a cadeia passou a mostrar o caminho
        // do dinheiro saindo, e não o pagamento voltando.
        const isYou = index === 0;
        const isUltimo = index === chain.length - 1;
        const atraso = index * porElo;

        return (
          <li key={node} className="flex flex-col sm:flex-row sm:items-stretch">
            <motion.div
              className="relative flex min-h-[3.5rem] flex-1 items-center overflow-hidden border px-4 py-3 text-center text-sm leading-snug sm:min-w-[9rem] sm:justify-center"
              style={{
                borderColor: isYou ? accent : "var(--color-edge)",
                color: isYou ? accent : "var(--color-aux)",
                background: isYou ? "rgba(227,188,126,.06)" : "transparent",
              }}
              variants={{
                oculto: parado ? {} : { opacity: 0.35 },
                visivel: { opacity: 1 },
              }}
              transition={{ duration: 0.5, delay: parado ? 0 : atraso }}
            >
              {/* O dinheiro passando por este elo: um clarão que atravessa e some. */}
              {parado ? null : (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `linear-gradient(100deg, transparent 20%, ${accent}, transparent 80%)`,
                  }}
                  variants={{
                    oculto: { opacity: 0, x: "-110%" },
                    visivel: { opacity: [0, 0.22, 0], x: ["-110%", "110%"] },
                  }}
                  transition={{ duration: 0.85, delay: atraso, ease: "easeInOut" }}
                />
              )}
              <span className="relative">{node}</span>
            </motion.div>

            {!isUltimo ? (
              <motion.span
                aria-hidden="true"
                className="flex items-center justify-center py-2 font-mono text-sm sm:px-3 sm:py-0"
                style={{ color: accent }}
                variants={{
                  oculto: parado ? {} : { opacity: 0.2 },
                  visivel: { opacity: 1 },
                }}
                transition={{ duration: 0.4, delay: parado ? 0 : atraso + porElo * 0.5 }}
              >
                <span className="sm:hidden">↓</span>
                <span className="hidden sm:inline">→</span>
              </motion.span>
            ) : null}
          </li>
        );
      })}
    </motion.ol>
  );
}
