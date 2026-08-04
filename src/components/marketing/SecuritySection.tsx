import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/**
 * Seção "Segurança e Estrutura".
 *
 * Todo texto aqui é estrutural: descreve como o instrumento é montado e onde
 * conferir. Nenhum item diz se a estrutura da carteira do usuário está adequada
 * — isso seria avaliação, não descrição.
 */
const TOPICS = [
  {
    title: "Proteção do FGC",
    body:
      "Mostramos quais dos seus ativos são de tipos cobertos pelo Fundo Garantidor de " +
      "Créditos e quanto você tem em cada instituição. A cobertura é contada por CPF e " +
      "por instituição, com teto global por período, então a informação relevante é o " +
      "quanto está em cada uma — e essa conta a gente exibe.",
    footnote: "Limites e regras vigentes: fgc.org.br",
  },
  {
    title: "Concentração por instituição",
    body:
      "A leitura agrupa a carteira por instituição emissora e mostra a participação de " +
      "cada uma. É um dado sobre a estrutura da carteira, útil justamente por conversar " +
      "com o limite de cobertura do FGC descrito acima.",
    footnote: "Somamos e agrupamos. A leitura do que isso significa é sua.",
  },
  {
    title: "Calendário de vencimentos",
    body:
      "Ativos com data de vencimento entram em uma linha do tempo: o que vence este mês, " +
      "no trimestre, no ano. Você passa a enxergar em uma tela só o que hoje está " +
      "espalhado entre extratos de corretoras diferentes.",
    footnote: "Datas conforme informadas por você na entrada dos ativos.",
  },
  {
    title: "Liquidez declarada",
    body:
      "Cada ficha descreve como funciona o resgate daquele tipo de ativo: liquidez " +
      "diária, carência mínima definida em norma, negociação apenas em mercado " +
      "secundário ou recompra a critério do emissor.",
    footnote: "Condições específicas do seu papel constam no contrato da emissão.",
  },
] as const;

export function SecuritySection() {
  return (
    <Section
      id="seguranca"
      eyebrow="Segurança e estrutura"
      title={
        <>
          Como a sua carteira
          <br />
          <span className="text-blue-200">está montada por dentro.</span>
        </>
      }
      description={
        <p>
          Quatro leituras estruturais sobre o que você já tem. Todas descritivas: o
          sistema mostra a estrutura e aponta onde conferir cada dado na fonte oficial.
        </p>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {TOPICS.map((topic, index) => (
          <Reveal key={topic.title} delay={index * 0.09}>
            <article className="surface h-full rounded-2xl p-8 transition-colors duration-500 hover:border-gold/40">
              <div aria-hidden="true" className="mb-6 h-px w-12 bg-gold" />
              <h3 className="text-xl sm:text-2xl">{topic.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-blue-200">{topic.body}</p>
              <p className="mt-6 border-t border-blue/20 pt-4 text-xs text-blue-200/60">
                {topic.footnote}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
