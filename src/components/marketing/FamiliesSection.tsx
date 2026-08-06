import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import { profileFor } from "@/domain/assets/profiles";
import { DEPTH_LABELS, PRODUCT_FAMILIES } from "@/domain/assets/families";

/**
 * As famílias de produto, organizadas por quem paga você.
 *
 * O critério é o conteúdo desta seção, e não um detalhe de arrumação: a
 * pergunta que realmente separa um produto do outro é de onde sai o dinheiro
 * que volta. Agrupar por rentabilidade ou risco seria julgar; agrupar pela
 * origem do pagamento é descrever a estrutura.
 */
export function FamiliesSection() {
  return (
    <section
      id="familias"
      data-depth="2"
      aria-labelledby="familias-title"
      className="relative overflow-hidden border-t border-edge-soft bg-water px-6 py-24 sm:px-10 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#0c2530,#0a1f28_60%,#081a21)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-[62%] top-[-80px] h-[560px] w-[180px] skew-x-[-10deg] bg-[linear-gradient(176deg,rgba(201,149,74,.12),transparent_66%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="tech text-amber">Coluna d&apos;água · a pergunta que separa tudo</p>
          <h2
            id="familias-title"
            className="mt-6 max-w-[16ch] text-[clamp(2rem,5vw,3.4rem)] leading-[1.04]"
          >
            Quem, exatamente, paga você?
          </h2>
          <p className="mt-7 max-w-[58ch] text-lg leading-relaxed text-aux">
            É a pergunta que distingue um produto do outro — mais do que a sigla, o prazo
            ou o nome do banco que vendeu. Um banco, o Tesouro, uma carteira de recebíveis,
            uma empresa, um condomínio de cotistas, o mercado, uma seguradora.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCT_FAMILIES.map((family, index) => (
            <Reveal key={family.id} delay={index * 0.05}>
              <article className="group relative flex h-full flex-col border border-edge bg-surface/70 p-7 transition-colors duration-500 hover:border-light/45 hover:bg-surface">
                {/* Marcador de profundidade: quantas camadas até quem paga. */}
                <span
                  aria-hidden="true"
                  className="absolute right-6 top-7 flex gap-1"
                >
                  {[1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className="block h-3 w-px transition-colors duration-500"
                      style={{
                        background:
                          level <= family.depth ? "var(--color-amber)" : "var(--color-edge)",
                      }}
                    />
                  ))}
                </span>

                <p className="tech text-tertiary">{DEPTH_LABELS[family.depth]}</p>
                <h3 className="mt-4 text-2xl leading-tight">{family.label}</h3>

                <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-light">
                  {family.whoPays}
                </p>

                <p className="mt-4 flex-1 text-base leading-relaxed text-aux">{family.blurb}</p>

                <ul className="mt-6 flex flex-wrap gap-2 border-t border-edge-soft pt-5">
                  {family.classes.map((assetClass) => (
                    <li key={assetClass}>
                      <Link
                        href={`/produtos/${assetClass}`}
                        className="block border border-edge px-2.5 py-1 font-mono text-[11px] text-body transition-colors duration-300 hover:border-light hover:text-light"
                      >
                        {profileFor(assetClass).label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
