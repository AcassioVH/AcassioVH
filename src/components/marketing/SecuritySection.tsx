import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/**
 * "Nível 4 · documentos e estrutura".
 *
 * Todo texto aqui é estrutural: descreve como o instrumento é montado e onde
 * conferir. Nenhum item diz se a estrutura da carteira do usuário está
 * adequada — isso seria avaliação, e avaliação vive no nível 5.
 */
const TOPICS = [
  {
    title: "Cobertura do FGC",
    body:
      "Mostramos quais dos seus ativos são de tipos cobertos pelo Fundo Garantidor de " +
      "Créditos e quanto você tem em cada instituição. A cobertura é contada por CPF e por " +
      "instituição, então a informação relevante é o quanto está em cada uma — e essa conta " +
      "a gente exibe.",
    note: "Limites vigentes: fgc.org.br",
  },
  {
    title: "Concentração por instituição",
    body:
      "A leitura agrupa a carteira por instituição emissora e mostra a participação de cada " +
      "uma. É um dado sobre a estrutura da carteira, útil justamente por conversar com o " +
      "limite de cobertura descrito acima.",
    note: "Somamos e agrupamos. A leitura do que isso significa é sua.",
  },
  {
    title: "Calendário de vencimentos",
    body:
      "Ativos com data de vencimento entram em uma linha do tempo: o que vence neste mês, no " +
      "trimestre, no ano. Você passa a enxergar em uma tela só o que hoje está espalhado " +
      "entre extratos de corretoras diferentes.",
    note: "Datas conforme informadas por você.",
  },
  {
    title: "Liquidez declarada",
    body:
      "Cada verbete descreve como funciona o resgate daquele tipo de ativo: liquidez diária, " +
      "carência mínima definida em norma, negociação apenas em mercado secundário ou recompra " +
      "a critério do emissor.",
    note: "Condições do seu papel constam no contrato da emissão.",
  },
] as const;

export function SecuritySection() {
  return (
    <Section
      id="seguranca"
      depth="base"
      eyebrow="Nível 4 · estrutura e documentos"
      title="Como a sua carteira está montada por dentro."
      description={
        <p>
          Quatro leituras estruturais sobre o que você já tem. Todas descritivas: o sistema
          mostra a estrutura e aponta onde conferir cada dado na fonte oficial.
        </p>
      }
    >
      <div className="grid gap-px sm:grid-cols-2">
        {TOPICS.map((topic, index) => (
          <Reveal key={topic.title} delay={index * 0.07}>
            <article className="h-full border border-edge bg-surface p-7 transition-colors duration-300 hover:border-light/40 sm:p-8">
              <div aria-hidden="true" className="mb-6 h-px w-10 bg-amber" />
              <h3 className="text-xl sm:text-2xl">{topic.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-aux">{topic.body}</p>
              <p className="mt-6 border-t border-edge-soft pt-4 font-mono text-[11px] leading-relaxed text-muted">
                {topic.note}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
