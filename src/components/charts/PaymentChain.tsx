/**
 * O caminho do dinheiro, desenhado.
 *
 * Cada família de produto tem uma cadeia de pagamento — de onde sai o dinheiro,
 * por quantas mãos passa, e em qual delas você está. Ver "Devedores dos
 * recebíveis → Securitizadora → Você" ao lado de "Tesouro Nacional → Você"
 * ensina, em um olhar, a diferença que três parágrafos de texto não fixam.
 *
 * É diagrama de estrutura, não de mérito: mais elos não significa pior, e menos
 * elos não significa melhor. Por isso nada aqui é maior, mais forte ou mais
 * destacado que o resto — só o último nó, que é você, ganha contorno, e é
 * orientação, não avaliação.
 *
 * Horizontal em tela larga, vertical no telefone: a seta gira, a leitura não
 * muda.
 */

export function PaymentChain({
  chain,
  accent = "var(--color-light)",
  className = "",
}: {
  chain: readonly string[];
  accent?: string;
  className?: string;
}) {
  return (
    <ol
      className={`flex flex-col gap-0 sm:flex-row sm:flex-wrap sm:items-stretch ${className}`}
      aria-label="Caminho do pagamento"
    >
      {chain.map((node, index) => {
        const isYou = index === chain.length - 1;

        return (
          <li key={node} className="flex flex-col sm:flex-row sm:items-stretch">
            <div
              className="flex min-h-[3.5rem] flex-1 items-center border px-4 py-3 text-center text-sm leading-snug sm:min-w-[9rem] sm:justify-center"
              style={{
                borderColor: isYou ? accent : "var(--color-edge)",
                color: isYou ? accent : "var(--color-aux)",
                background: isYou ? "rgba(227,188,126,.06)" : "transparent",
              }}
            >
              {node}
            </div>

            {!isYou ? (
              <span
                aria-hidden="true"
                className="flex items-center justify-center py-2 font-mono text-sm sm:px-3 sm:py-0"
                style={{ color: accent }}
              >
                <span className="sm:hidden">↓</span>
                <span className="hidden sm:inline">→</span>
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
