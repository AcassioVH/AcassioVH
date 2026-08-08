import type { Metadata } from "next";
import Link from "next/link";

import { Caustics, MarineSnow } from "@/components/experience/Caustics";
import { DepthGauge } from "@/components/experience/DepthGauge";
import { Footer } from "@/components/marketing/Footer";
import { Nav } from "@/components/marketing/Nav";
import { TrilhaJsonLd } from "@/components/seo/StructuredData";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA, WhatsAppStrip } from "@/components/ui/WhatsAppCTA";
import { site } from "@/config/site";
import { profileFor } from "@/domain/assets/profiles";
import {
  INSTITUTION_GROUPS,
  INSTITUTION_KINDS,
  NOT_A_FINANCIAL_INSTITUTION,
  WHERE_TO_CHECK,
  kindsOf,
} from "@/domain/institutions/kinds";

/**
 * A outra metade da pergunta.
 *
 * O site inteiro responde "para onde vai o seu dinheiro". Cada ficha diz
 * "emitido por instituição financeira autorizada pelo Banco Central" e segue em
 * frente, como se a frase se explicasse sozinha. Não se explica: é exatamente
 * nessa frase que mora a diferença entre ter FGC e não ter, entre emprestar a
 * um banco e emprestar a uma empresa, entre quem emite o papel e quem apenas o
 * vende.
 *
 * **Tipos, não nomes.** A página descreve categorias jurídicas de instituição.
 * Não descreve, não compara e não qualifica nenhuma instituição específica —
 * isso seria análise de emissor. Em lugar disso, ela entrega o endereço do
 * órgão que supervisiona cada tipo, para o visitante consultar por conta
 * própria a instituição que lhe interessa. O raciocínio é o mesmo das fontes
 * oficiais de cada verbete: aqui se aprende a ler, lá se confere o dado.
 */
export const metadata: Metadata = {
  title: "Instituições financeiras",
  description:
    "Os tipos de instituição que aparecem no caminho do seu dinheiro: o que cada uma pode " +
    "emitir, quem autoriza o funcionamento dela e qual garantia se aplica — com o endereço " +
    "oficial para conferir uma instituição específica.",
  alternates: { canonical: "/instituicoes" },
};

function GroupSection({
  group,
  index,
}: {
  group: (typeof INSTITUTION_GROUPS)[number];
  index: number;
}) {
  const kinds = kindsOf(group);
  // Alterna fundo a cada bloco: a página é longa, e a troca de plano é o que
  // impede que ela vire uma parede única de texto.
  const escuro = index % 2 === 0;

  return (
    <section
      data-depth={Math.min(4, index + 2)}
      aria-labelledby={`grupo-${group.id}`}
      className={`border-b border-edge-soft px-6 py-20 sm:px-10 sm:py-24 ${
        escuro ? "bg-deep" : "bg-surface"
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="tech" style={{ color: group.accent }}>
            {String(index + 1).padStart(2, "0")} · {kinds.length}{" "}
            {kinds.length === 1 ? "tipo" : "tipos"}
          </p>
          <h2
            id={`grupo-${group.id}`}
            className="mt-5 max-w-[24ch] text-[clamp(1.7rem,4vw,2.6rem)] leading-tight"
          >
            {group.label}
          </h2>
          <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-aux">{group.summary}</p>
        </Reveal>

        <ul className="mt-12 space-y-px">
          {kinds.map((kind, i) => (
            /*
              A âncora vive no `<li>`, e não no cartão revelado.
              O menu leva direto a `/instituicoes#corretora`, e o `Reveal` entra
              com `y: 28`: se a âncora estivesse no elemento animado, o navegador
              rolaria até a posição deslocada e o cartão subiria 28 px logo em
              seguida, parando por baixo da barra fixa. O `<li>` não se move.
            */
            <li key={kind.id} id={kind.id} className="scroll-mt-28">
              <Reveal delay={i * 0.06}>
                <article className="border border-edge bg-surface/60 p-7 sm:p-9">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
                    <div>
                      <h3 className="max-w-[26ch] text-2xl leading-tight">{kind.label}</h3>
                      {kind.alias ? (
                        <p className="mt-2 text-sm italic text-muted">
                          também chamada de {kind.alias}
                        </p>
                      ) : null}
                    </div>
                    <p
                      className="font-mono text-[11px] uppercase tracking-[0.14em]"
                      style={{ color: group.accent }}
                    >
                      Autorização: {kind.supervisor}
                    </p>
                  </div>

                  <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-body">{kind.role}</p>
                  <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-aux">
                    {kind.whatItIs}
                  </p>

                  <dl className="mt-8 border-t border-edge-soft">
                    <div className="grid grid-cols-1 gap-2 border-b border-edge-soft py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
                      <dt className="font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted">
                        Pode emitir
                      </dt>
                      <dd className="text-sm leading-relaxed text-aux">
                        {kind.issues.length > 0 ? (
                          <ul className="flex flex-wrap gap-2">
                            {kind.issues.map((assetClass) => (
                              <li key={assetClass}>
                                <Link
                                  href={`/produtos/${assetClass}`}
                                  className="block border border-edge px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-body transition-colors duration-300 hover:border-light hover:text-light"
                                >
                                  {profileFor(assetClass).label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          kind.issuesNote
                        )}
                      </dd>
                    </div>

                    <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
                      <dt className="font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-muted">
                        Garantia
                      </dt>
                      <dd className="text-sm leading-relaxed text-aux">
                        {/*
                          Estado é sempre cor + palavra, nunca cor sozinha: o rótulo
                          diz "Fora do FGC" por escrito, e a cor apenas acompanha.
                        */}
                        <span
                          className="mr-2 inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
                          style={{ borderColor: group.accent, color: group.accent }}
                        >
                          {kind.guaranteeTag}
                        </span>
                        {kind.guarantee}
                      </dd>
                    </div>
                  </dl>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function InstitutionsPage() {
  return (
    <>
      <Nav />
      <DepthGauge />

      <main id="conteudo">
        <header
          data-depth="1"
          className="relative overflow-hidden border-b border-edge-soft px-6 pb-16 pt-32 sm:px-10 sm:pb-20 sm:pt-40"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,#12333b,#0c2530_55%,#0b1d24)]"
          />
          <div
            aria-hidden="true"
            className="absolute left-[66%] top-[-90px] h-[440px] w-[150px] skew-x-[-10deg] bg-[linear-gradient(176deg,rgba(227,188,126,.16),transparent_68%)]"
          />
          <Caustics className="h-[62%] opacity-60" />
          <MarineSnow parallax />

          <div className="relative mx-auto max-w-5xl">
            <Link
              href="/"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-tertiary transition-colors hover:text-light"
            >
              ← Início
            </Link>

            <h1 className="mt-8 max-w-[16ch] text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.03]">
              Instituições financeiras
            </h1>

            <p className="mt-6 max-w-[54ch] text-xl leading-relaxed text-body">
              Toda ficha deste site diz de quem é a emissão. Aqui você descobre o que cada um
              desses nomes significa — o que o tipo pode emitir, quem o autoriza a funcionar e
              qual garantia se aplica ao dinheiro que passa por ele.
            </p>

            <p className="mt-7 max-w-[54ch] border-l border-amber pl-5 text-lg leading-relaxed text-aux">
              São tipos de instituição, não instituições com nome. Para olhar uma instituição
              específica, o endereço oficial está no fim da página — na fonte que a
              supervisiona.
            </p>

            <p className="mt-10 font-mono text-[11px] uppercase leading-5 tracking-[0.14em] text-muted">
              {INSTITUTION_KINDS.length} tipos · {INSTITUTION_GROUPS.length} funções no caminho
              do dinheiro
            </p>
          </div>
        </header>

        {INSTITUTION_GROUPS.map((group, index) => (
          <GroupSection key={group.id} group={group} index={index} />
        ))}

        {/* O engano mais comum de quem acabou de ler o resto. */}
        <section
          aria-labelledby="nao-financeira"
          className="border-b border-edge-soft bg-deep px-6 py-20 sm:px-10 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="tech text-tertiary">Uma ressalva</p>
              <h2
                id="nao-financeira"
                className="mt-5 max-w-[22ch] text-[clamp(1.7rem,4vw,2.6rem)] leading-tight"
              >
                Nem todo emissor é instituição financeira.
              </h2>
              <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-aux">
                {NOT_A_FINANCIAL_INSTITUTION}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  href="/categorias/renda-fixa"
                  className="block border border-edge px-5 py-3 text-base text-body transition-colors duration-300 hover:border-light hover:text-light"
                >
                  Ver crédito privado
                </Link>
                <Link
                  href="/categorias/renda-variavel"
                  className="block border border-edge px-5 py-3 text-base text-body transition-colors duration-300 hover:border-light hover:text-light"
                >
                  Ver participação societária
                </Link>
              </div>
            </Reveal>

            <div className="mt-12">
              <WhatsAppStrip
                subject="a diferença entre os tipos de instituição financeira"
                label="Ficou alguma dúvida sobre quem emite o quê? Fale comigo no WhatsApp."
              />
            </div>
          </div>
        </section>

        {/* O contraponto de não nomear ninguém: o endereço de quem tem o dado. */}
        <section
          data-depth="4"
          aria-labelledby="conferir"
          className="border-b border-edge-soft bg-surface px-6 py-20 sm:px-10 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="tech text-amber">Onde conferir uma instituição específica</p>
              <h2
                id="conferir"
                className="mt-5 max-w-[24ch] text-[clamp(1.7rem,4vw,2.6rem)] leading-tight"
              >
                O dado está na fonte que supervisiona.
              </h2>
              <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-aux">
                Este site não descreve instituições pelo nome — nem para elogiar, nem para o
                contrário. O que ele faz é te levar direto a quem publica a informação oficial
                sobre cada uma delas.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-px sm:grid-cols-2">
              {WHERE_TO_CHECK.map((source, i) => (
                <Reveal key={source.url + source.label} delay={i * 0.05} as="li">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col border border-edge bg-surface/60 p-7 transition-colors duration-500 hover:border-light/40 hover:bg-surface"
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-light">
                      {source.label}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-aux">
                      Você encontra lá {source.whatYouFindThere}.
                    </p>
                    <span className="mt-auto pt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-tertiary transition-colors duration-300 group-hover:text-light">
                      Abrir site oficial ↗
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>

            <footer className="mt-14 border-t border-edge-soft pt-7">
              <Disclaimer />
            </footer>
          </div>
        </section>

        <WhatsAppCTA
          title="Quer entender quem está por trás de um produto?"
          subject="os tipos de instituição financeira e quem emite cada produto"
        />
      </main>

      <Footer />

      <TrilhaJsonLd
        itens={[
          { nome: site.name, url: site.url },
          { nome: "Instituições financeiras", url: `${site.url}/instituicoes` },
        ]}
      />
    </>
  );
}
