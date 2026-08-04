import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { DISCLAIMER_FULL } from "@/domain/compliance/policy";

/**
 * Seção "Nosso limite".
 *
 * Não estava no briefing como seção própria, e proponho que esteja: o limite
 * regulatório é a restrição mais forte do produto, e produtos financeiros que
 * explicam o próprio limite tendem a ganhar confiança em vez de perder. Deixar
 * a fronteira implícita convida o usuário a projetar expectativa de conselho
 * onde ela não existe — e a frustração vira reclamação, ou coisa pior.
 */
const WE_DO = [
  "Identificamos cada ativo pelo CNPJ e classificamos por tipo.",
  "Organizamos a composição por classe de ativo e por instituição.",
  "Explicamos como funciona cada tipo: liquidez, tributação e garantia.",
  "Apontamos a fonte oficial para você conferir os números por conta própria.",
] as const;

const WE_DO_NOT = [
  "Não dizemos o que comprar, o que manter ou o que trocar.",
  "Não classificamos ativo como bom ou ruim, adequado ou inadequado.",
  "Não calculamos nem afirmamos rentabilidade — isso é papel da fonte oficial.",
  "Não fazemos projeção de retorno nem previsão de preço.",
] as const;

export function BoundarySection() {
  return (
    <Section
      id="limite"
      eyebrow="Nosso limite"
      title={
        <>
          O que fazemos —
          <br />
          <span className="text-blue-200">e o que não fazemos.</span>
        </>
      }
      description={
        <p>
          Esta plataforma produz um relatório descritivo de composição de carteira. Essa
          escolha é deliberada e define o produto inteiro, então preferimos declará-la
          na porta de entrada em vez de escondê-la no rodapé.
        </p>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="surface h-full rounded-2xl p-8 sm:p-10">
            <h3 className="mb-8 flex items-center gap-3 text-xl">
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-full bg-gold/15 text-sm text-gold"
              >
                ✓
              </span>
              O que fazemos
            </h3>
            <ul className="space-y-5">
              {WE_DO.map((item) => (
                <li key={item} className="flex gap-3.5 text-sm leading-relaxed text-mist/90">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="h-full rounded-2xl border border-blue/25 bg-navy/40 p-8 sm:p-10">
            <h3 className="mb-8 flex items-center gap-3 text-xl text-blue-200">
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-full bg-blue/25 text-sm"
              >
                —
              </span>
              O que não fazemos
            </h3>
            <ul className="space-y-5">
              {WE_DO_NOT.map((item) => (
                <li key={item} className="flex gap-3.5 text-sm leading-relaxed text-blue-200">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-200/50"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <div className="mt-10 rounded-2xl border border-gold/20 bg-gold/[0.04] p-8">
          <h3 className="mb-4 font-serif text-base text-gold">Aviso legal</h3>
          <p className="text-sm leading-relaxed text-blue-200">{DISCLAIMER_FULL}</p>
        </div>
      </Reveal>
    </Section>
  );
}
