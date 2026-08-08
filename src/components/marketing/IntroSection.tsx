/**
 * A apresentação: o que este site é, em três frases.
 *
 * Vem logo depois do hero e antes das categorias porque a pergunta que o
 * visitante faz primeiro não é "o que é um CRA" — é "o que eu faço aqui".
 *
 * **Tinha três passos numerados aqui, e eles saíram.** "Escolha uma categoria,
 * veja para onde vai o dinheiro, leia a ficha" descrevia em texto exatamente o que a
 * seção seguinte já faz acontecer — instruir alguém a clicar num cartão que
 * está logo abaixo é redundância que atrasa o clique. Numeração só se justifica
 * quando a ordem carrega informação que o leitor precisa; aqui a ordem estava
 * na própria tela.
 */

import { MarineSnow } from "@/components/experience/Caustics";
import { Reveal } from "@/components/ui/Reveal";

export function IntroSection() {
  return (
    <section
      id="o-que-e"
      data-depth="2"
      aria-labelledby="o-que-e-title"
      className="relative overflow-hidden border-t border-edge-soft px-6 py-20 sm:px-10 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#0c2530,#0a1f28_60%,#081a21)]"
      />
      <MarineSnow className="opacity-55" />

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
            Cada produto do mercado brasileiro explicado pela estrutura: o que ele é, para
            onde vai o seu dinheiro, em que prazo e sob quais regras. Sem recomendação, sem
            ranking, sem promessa de retorno — e sem pedir seus dados.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
