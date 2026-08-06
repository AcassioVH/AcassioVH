/**
 * A tabela regressiva do IR, em barras.
 *
 * Esta é a informação que mais aparece nos verbetes de renda fixa, e a que mais
 * se perde em prosa: "22,5% até 180 dias, 20% de 181 a 360, 17,5% de 361 a 720 e
 * 15% acima de 720". Em barra, a escada aparece de uma vez.
 *
 * Por que este gráfico é descrição e não recomendação: a alíquota não é opinião
 * nossa nem estimativa — é a regra vigente, publicada pela Receita Federal, e
 * está aqui com o link para conferir. O gráfico não sugere prazo de aplicação,
 * não projeta valor e não diz o que compensa; mostra a alíquota que a lei
 * associa a cada faixa de prazo.
 *
 * A barra é proporcional à alíquota — quanto maior a barra, maior o imposto —
 * e a leitura está escrita ao lado, para não depender do desenho.
 */

const BRACKETS = [
  { period: "Até 180 dias", rate: 22.5 },
  { period: "De 181 a 360 dias", rate: 20 },
  { period: "De 361 a 720 dias", rate: 17.5 },
  { period: "Acima de 720 dias", rate: 15 },
] as const;

const MAX_RATE = 22.5;

export function TaxLadder({ className = "" }: { className?: string }) {
  return (
    <figure className={`border border-edge bg-inset p-7 sm:p-9 ${className}`}>
      <figcaption>
        <p className="tech text-light">Tabela regressiva do imposto de renda</p>
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-aux">
          Boa parte dos produtos de renda fixa segue esta escada: a alíquota retida na
          fonte cai conforme o prazo da aplicação aumenta. Ela não se aplica a todos —
          LCI, LCA, CRI, CRA e poupança têm regra própria de isenção para pessoa física.
        </p>
      </figcaption>

      <ul className="mt-8 space-y-4">
        {BRACKETS.map((bracket) => (
          <li key={bracket.period} className="grid grid-cols-[1fr] gap-2 sm:grid-cols-[13rem_1fr]">
            <span className="text-base text-body">{bracket.period}</span>

            <span className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="block h-2.5 bg-[linear-gradient(90deg,var(--color-amber-deep),var(--color-amber))]"
                style={{ width: `${(bracket.rate / MAX_RATE) * 100}%` }}
              />
              <span className="tabular shrink-0 font-mono text-sm text-light">
                {bracket.rate.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-8 border-t border-edge-soft pt-5 text-sm leading-relaxed text-muted">
        Regras tributárias mudam por lei e por medida provisória. Confira a regra vigente
        na{" "}
        <a
          href="https://www.gov.br/receitafederal/pt-br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-light underline decoration-light/30 underline-offset-4 transition-colors hover:decoration-light"
        >
          Receita Federal ↗
        </a>{" "}
        ou com seu contador. Há ainda IOF regressivo nos primeiros 30 dias.
      </p>
    </figure>
  );
}
