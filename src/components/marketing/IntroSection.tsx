/**
 * A apresentação: o que este site é, em três passos.
 *
 * Vem logo depois do hero e antes das categorias porque a pergunta que o
 * visitante faz primeiro não é "o que é um CRA" — é "o que eu faço aqui". Três
 * blocos curtos respondem isso e entregam o leitor à navegação.
 *
 * O terceiro passo é o limite do serviço, dito cedo em vez de escondido no
 * rodapé: quem vai ler conteúdo sobre dinheiro merece saber, na primeira tela de
 * conteúdo, que aqui ninguém vai lhe dizer o que comprar.
 */

import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    number: "01",
    title: "Escolha uma categoria",
    body:
      "Renda fixa, renda variável, internacional e as demais. São os nomes que você já " +
      "ouviu — servem de porta de entrada.",
  },
  {
    number: "02",
    title: "Veja quem paga você",
    body:
      "Dentro de cada categoria, os produtos estão agrupados pela origem do pagamento: " +
      "o Tesouro, um banco, uma empresa, uma carteira de recebíveis, um fundo.",
  },
  {
    number: "03",
    title: "Leia a ficha do produto",
    body:
      "O que é, quem emite, quando o dinheiro sai, qual o imposto e qual a garantia — " +
      "com o link para conferir cada número na fonte oficial.",
  },
] as const;

export function IntroSection() {
  return (
    <section
      id="o-que-e"
      data-depth="2"
      aria-labelledby="o-que-e-title"
      className="relative overflow-hidden border-t border-edge-soft px-6 py-24 sm:px-10 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#0c2530,#0a1f28_60%,#081a21)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="tech text-amber">O que é este site</p>
          <h2
            id="o-que-e-title"
            className="mt-6 max-w-[20ch] text-[clamp(2rem,5vw,3.2rem)] leading-[1.06]"
          >
            Um dicionário de produtos de investimento.
          </h2>
          <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-aux">
            Cada produto do mercado brasileiro explicado pela estrutura: o que ele é, quem
            paga você, em que prazo e sob quais regras. Sem recomendação, sem ranking, sem
            promessa de retorno — e sem pedir seus dados.
          </p>
        </Reveal>

        <ol className="mt-16 grid gap-px sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08} as="li">
              <div className="flex h-full flex-col border border-edge bg-surface/50 p-8">
                <span
                  aria-hidden="true"
                  className="font-mono text-sm tracking-[0.2em] text-amber"
                >
                  {step.number}
                </span>
                <h3 className="mt-6 text-2xl leading-tight">{step.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-aux">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
