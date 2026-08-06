import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { DISCLAIMER_FULL } from "@/domain/compliance/policy";

/**
 * "Fundo · onde a nossa luz para".
 *
 * O nível 5 da escala de profundidade — o abismo — é onde ficam recomendação,
 * projeção e juízo de mérito. Esta seção é o produto declarando o próprio limite
 * na cor mais escura do sistema, e não só no rodapé legal.
 */
const FINDS = [
  "Estrutura do ativo",
  "Origem dos pagamentos",
  "Ordem de recebimento",
  "Prazos e vencimentos",
  "Cobertura do FGC por instituição",
  "Fontes oficiais para conferir",
] as const;

const DOES_NOT_FIND = [
  "Recomendação de compra",
  "Sugestão de realocação",
  "Nota ou ranking de ativo",
  "Projeção de retorno",
  "Comparação entre posições",
  "Alerta de urgência",
] as const;

export function BoundarySection() {
  return (
    <Section
      id="limite"
      depth="abyss"
      beam
      eyebrow="Fundo · onde a nossa luz para"
      title="Descrevemos até aqui. A decisão continua sua."
      description={
        <p>
          A plataforma não emite recomendação, não classifica ativos por qualidade, não compara
          posições da sua carteira e não sugere realocação. Essa fronteira é o desenho do
          serviço, e está declarada em todas as telas.
        </p>
      }
    >
      <div className="grid gap-px sm:grid-cols-2">
        <Reveal>
          <div className="h-full border border-[#14232A] bg-[#070D0F] p-7 sm:p-8">
            <p className="tech mb-4 text-st-identified">Encontra</p>
            <ul className="space-y-2.5 text-base leading-relaxed text-body">
              {FINDS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="h-full border border-[#14232A] bg-[#070D0F] p-7 sm:p-8">
            <p className="tech mb-4 text-[#B5786A]">Não encontra</p>
            <ul className="space-y-2.5 text-base leading-relaxed text-tertiary">
              {DOES_NOT_FIND.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.16}>
        <div className="mt-px border border-[#14232A] bg-[#070D0F] p-7 sm:p-8">
          <p className="tech mb-3 text-muted">Aviso legal</p>
          <p className="max-w-4xl text-sm leading-relaxed text-aux">{DISCLAIMER_FULL}</p>
        </div>
      </Reveal>
    </Section>
  );
}
