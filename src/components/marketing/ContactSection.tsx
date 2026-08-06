import { Caustics, MarineSnow } from "@/components/experience/Caustics";
import { Reveal } from "@/components/ui/Reveal";
import { site, whatsappIsConfigured, whatsappUrl } from "@/config/site";

/**
 * O destino da página.
 *
 * Toda a descida termina aqui. Depois de explicar as estruturas e declarar o
 * limite do serviço, o único passo que sobra é falar com alguém — e é por isso
 * que esta seção volta à luz: é a única do site que sobe de novo na escala de
 * profundidade, saindo do abismo de volta para a superfície.
 *
 * O botão é grande e único. Não disputa espaço com formulário, newsletter ou
 * segundo caminho: a página inteira foi construída para chegar neste clique.
 */
function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}

export function ContactSection() {
  return (
    <section
      id="contato"
      data-depth="1"
      aria-labelledby="contato-title"
      className="relative overflow-hidden border-t border-edge-soft"
    >
      {/* A subida de volta à luz: o gradiente inverte o do hero. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#040809_0%,#081820_28%,#0c2530_62%,#12333b_100%)]"
      />
      <Caustics className="top-auto h-[55%] opacity-70" />
      <MarineSnow className="opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_120%,rgba(227,188,126,.3)_0%,rgba(201,149,74,.08)_45%,transparent_75%)]"
      />

      <div className="relative mx-auto max-w-4xl px-6 py-28 text-center sm:px-10 sm:py-36">
        <Reveal>
          <p className="tech text-light">De volta à superfície</p>

          <h2
            id="contato-title"
            className="mx-auto mt-8 max-w-[16ch] text-[clamp(2.2rem,6vw,4rem)] leading-[1.02]"
          >
            A decisão continua sua.
          </h2>

          <p className="mx-auto mt-8 max-w-[52ch] text-xl leading-relaxed text-body">
            Se quiser conversar sobre o que fazer com isso, fale com o {site.advisor.name} —
            assessor de investimentos na {site.advisor.firm}. É uma conversa com uma pessoa,
            não um formulário.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-14">
            {whatsappIsConfigured ? (
              <a
                href={whatsappUrl(
                  "Olá, Victor. Vim pelo site da Acássium Invest, estava lendo sobre os " +
                    "produtos de investimento e gostaria de conversar.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4 bg-light px-10 py-6 text-lg font-semibold text-[#060d10] shadow-[0_0_0_0_rgba(227,188,126,.45)] transition-all duration-500 hover:bg-[#f0d9b4] hover:shadow-[0_0_60px_-6px_rgba(227,188,126,.55)]"
              >
                <WhatsAppIcon className="size-7 transition-transform duration-500 group-hover:scale-110" />
                Falar com o {site.advisor.name.split(" ")[0]} no WhatsApp
              </a>
            ) : (
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex items-center gap-4 border border-light/50 px-10 py-6 text-lg font-semibold text-light transition-colors duration-300 hover:bg-light hover:text-[#060d10]"
              >
                {site.contact.email}
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-[54ch] text-sm leading-relaxed text-tertiary">
            O atendimento de assessoria acontece fora deste site, sob a regulamentação
            aplicável à atividade e à instituição. Este site é conteúdo educativo e não
            constitui recomendação de investimento.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
