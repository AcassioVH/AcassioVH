import { Reveal } from "@/components/ui/Reveal";

/**
 * O abismo — onde a nossa luz para.
 *
 * Nível 5 da escala de profundidade, e a seção mais escura do site. Recomendação,
 * projeção e juízo de mérito vivem aqui, fora do escopo. A marca declara o
 * próprio limite em cor antes de declará-lo em texto legal.
 *
 * A seção vem imediatamente antes do contato de propósito: é ela que explica
 * por que existe um assessor do outro lado, em vez de um botão de "invista
 * agora".
 */
const FINDS = [
  "O que o produto é, em português",
  "Quem paga você, e com que dinheiro",
  "Como funciona o resgate",
  "Qual a regra tributária vigente",
  "Qual a estrutura de garantia",
  "Onde conferir cada número na fonte oficial",
] as const;

const DOES_NOT_FIND = [
  "Recomendação de compra",
  "Ranking ou nota de produto",
  "Projeção de retorno",
  "Comparação de qual rende mais",
  "Indicação de adequação ao seu perfil",
  "Alerta de urgência ou oportunidade",
] as const;

export function BoundarySection() {
  return (
    <section
      id="limite"
      data-depth="5"
      aria-labelledby="limite-title"
      className="relative overflow-hidden border-t border-edge-soft bg-abyss px-6 py-24 sm:px-10 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,149,74,.35)_40%,transparent)]"
      />
      {/* A última réstia de luz, quase apagada. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_44%_at_50%_0%,rgba(201,149,74,.09)_0%,transparent_68%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="tech text-tertiary">Abismo · onde a nossa luz para</p>
          <h2
            id="limite-title"
            className="mt-6 max-w-[18ch] text-[clamp(2rem,5vw,3.4rem)] leading-[1.04]"
          >
            Descrevemos até aqui.
          </h2>
          <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-aux">
            Este site explica estruturas. Não recomenda produtos, não classifica por
            qualidade, não projeta retorno e não diz o que serve para você. Essa fronteira
            é o desenho do serviço — e é ela que faz o passo seguinte ser uma conversa com
            uma pessoa, e não um botão de comprar.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px lg:grid-cols-2">
          <Reveal>
            <div className="h-full border border-edge-soft bg-[#070d0f] p-8 sm:p-10">
              <p className="tech mb-6 text-st-identified">O que você encontra</p>
              <ul className="space-y-3.5">
                {FINDS.map((item) => (
                  <li key={item} className="flex gap-3.5 text-lg leading-relaxed text-body">
                    <span aria-hidden="true" className="mt-3 size-1 shrink-0 bg-st-identified" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="h-full border border-edge-soft bg-[#070d0f] p-8 sm:p-10">
              <p className="tech mb-6 text-[#b5786a]">O que você não encontra</p>
              <ul className="space-y-3.5">
                {DOES_NOT_FIND.map((item) => (
                  <li key={item} className="flex gap-3.5 text-lg leading-relaxed text-tertiary">
                    <span aria-hidden="true" className="mt-3 size-1 shrink-0 bg-[#b5786a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
