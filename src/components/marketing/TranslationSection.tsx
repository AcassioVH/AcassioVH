import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/**
 * "Coluna d'água · a tradução em três passos".
 *
 * A numeração aqui é legítima porque descreve uma sequência real: o ativo passa
 * por identificação, descrição e referência, nessa ordem. Não é ornamento.
 */
const STEPS = [
  {
    n: "01",
    title: "Identificação pelo nome e pelo CNPJ",
    body:
      "Cada linha da carteira é ligada ao registro do ativo. Para fundos, o CNPJ resolve " +
      "sozinho — eles têm registro próprio na CVM. Para CDB, LCI e LCA, o CNPJ é o da " +
      "instituição emissora, então cruzamos com o nome declarado e dizemos o grau de " +
      "confiança do resultado.",
  },
  {
    n: "02",
    title: "Descrição da estrutura",
    body:
      "O que o ativo é, quem emite, de onde vem o pagamento, como funciona o resgate e qual " +
      "a estrutura de garantia. Termos técnicos aparecem com definição, e o texto é escrito " +
      "em segunda pessoa, sem entusiasmo artificial.",
  },
  {
    n: "03",
    title: "Referência às fontes",
    body:
      "Rentabilidade, cotação e limites vigentes não são afirmados aqui: cada verbete aponta " +
      "para a fonte oficial — CVM, B3, FGC, Receita Federal — onde o número é publicado por " +
      "quem tem autoridade para isso.",
  },
] as const;

export function TranslationSection() {
  return (
    <Section
      id="traducao"
      depth="deep"
      eyebrow="Coluna d'água · a tradução em três passos"
      aside="Nenhum passo produz opinião sobre o ativo."
      title="Do nome exato ao que ele significa."
    >
      <div className="grid gap-px sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <Reveal key={step.n} delay={index * 0.08}>
            <article className="h-full border border-edge bg-[#0A1F27] p-7 sm:p-8">
              <p className="font-display text-3xl leading-none text-amber">{step.n}</p>
              <h3 className="mt-4 text-xl leading-tight sm:text-2xl">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-aux">{step.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
