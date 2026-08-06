import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";

/**
 * Hero — "Visto de cima, tudo parece igual".
 *
 * A composição inteira é a tese do produto em imagem: o fundo desce da água
 * rasa (#12333B) até a base, atravessado por feixes de luz. A coluna da direita
 * mostra a carteira como ela chega — siglas corretas e ilegíveis — e o resto da
 * página desce até a explicação.
 *
 * Não há mais cena 3D aqui. O design substituiu o objeto flutuante por
 * profundidade e luz, o que também eliminou ~350 KB de Three.js do carregamento
 * inicial e a necessidade de detectar WebGL. As camadas abaixo são CSS puro:
 * funcionam sem JavaScript, sem GPU e sem fallback.
 */

/** A carteira como ela chega: nomes exatos, sem significado para quem lê. */
const RAW_HOLDINGS = [
  { name: "FIDC MULTISETORIAL SÊNIOR", opacity: 1 },
  { name: "CRA GARANTIA REAL 2031", opacity: 0.88 },
  { name: "CRI SÉRIE 142 · IPCA+", opacity: 0.76 },
  { name: "DEB INCENT ENERGIA 12ª EM", opacity: 0.62 },
] as const;

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-edge-soft"
    >
      {/* Coluna d'água: a luz enfraquece conforme desce. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#12333B_0%,#0C2530_34%,#081820_66%,#060D10_100%)]"
      />
      {/* Cáustica: a trama que a luz faz ao atravessar a superfície. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-[repeating-linear-gradient(96deg,rgba(201,149,74,.20)_0_3px,rgba(6,13,16,0)_3px_16px,rgba(227,188,126,.10)_16px_19px,rgba(6,13,16,0)_19px_38px)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-[repeating-linear-gradient(84deg,rgba(234,237,236,.14)_0_2px,rgba(6,13,16,0)_2px_22px)]"
      />
      <div aria-hidden="true" className="beam absolute inset-x-0 top-0 h-[3px]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(58%_100%_at_66%_-14%,rgba(227,188,126,.30)_0%,rgba(201,149,74,.10)_40%,rgba(6,13,16,0)_72%)]"
      />
      {/* Dois feixes descendo, inclinados como a haste da marca. */}
      <div
        aria-hidden="true"
        className="shaft absolute left-[52%] top-[-40px] h-[620px] w-[150px] skew-x-[-11deg]"
      />
      <div
        aria-hidden="true"
        className="shaft absolute left-[66%] top-[-40px] h-[560px] w-[70px] skew-x-[-6deg] opacity-70"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-light">
            Serviço descritivo · não recomendamos ativos
          </p>

          <h1
            id="hero-title"
            className="mt-6 max-w-[19ch] text-4xl leading-[1.04] sm:text-5xl md:text-6xl"
          >
            Visto de cima, tudo parece igual.
          </h1>

          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-body sm:text-xl">
            A sua carteira chega como uma lista de siglas: FIDC multisetorial sênior, CRA com
            garantia real, CRI série 142. São nomes exatos que não dizem nada a quem não
            trabalha com eles.
          </p>

          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-body sm:text-xl">
            A Acássium parte do nome e do CNPJ e desce até o que o ativo é. Descreve a
            estrutura, a origem dos pagamentos, os prazos e onde conferir. Não avalia, não
            compara, não sugere troca.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/criar-conta"
              className="bg-light px-6 py-3.5 text-base font-semibold text-[#060D10] transition-colors duration-200 hover:bg-[#F0D9B4]"
            >
              Ver o que há na minha carteira
            </Link>
            <Link
              href="#ativos"
              className="border-b border-light/45 pb-0.5 text-base text-light transition-colors duration-200 hover:border-light"
            >
              Ler uma explicação de exemplo
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="flex h-full flex-col justify-center">
            <p className="tech mb-4 text-tertiary">Superfície · como a carteira chega</p>

            <ul className="flex flex-col gap-2.5">
              {RAW_HOLDINGS.map((holding) => (
                <li
                  key={holding.name}
                  className="flex items-baseline justify-between gap-4 border border-[rgba(163,197,202,.16)] bg-[rgba(9,26,33,.62)] px-5 py-4"
                  style={{ opacity: holding.opacity }}
                >
                  <span className="font-mono text-sm tracking-wide text-aux">{holding.name}</span>
                  <span className="whitespace-nowrap text-sm text-muted">sem descrição</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm leading-relaxed text-tertiary">
              Os nomes estão corretos — só não são compreensíveis.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
