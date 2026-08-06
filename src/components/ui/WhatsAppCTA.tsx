/**
 * O convite para conversar — o único destino do site.
 *
 * Está aqui, e não copiado em cada página, por dois motivos. O primeiro é
 * regulatório: a fronteira entre "conteúdo educativo" e "atendimento de
 * assessoria" precisa ser dita do mesmo jeito toda vez, e um componente único
 * garante isso melhor do que a disciplina de quem escreve a próxima página. O
 * segundo é de produto: quem entendeu um produto e ficou com dúvida não deveria
 * ter que rolar até o fim da página para achar por onde perguntar.
 *
 * Duas formas. `band` é a faixa larga que fecha uma página. `strip` é a linha
 * discreta que aparece no meio da leitura, sem interromper.
 *
 * O link cai para e-mail quando o número não tem forma discável — um `wa.me`
 * mal formado abre uma conversa vazia, e ninguém percebe que perdeu o contato.
 */

import { site, whatsappIsConfigured, whatsappUrl } from "@/config/site";

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}

/** Assunto da conversa. Vira o texto já preenchido na janela do WhatsApp. */
type Topic = { subject?: string };

function href({ subject }: Topic): string {
  if (!whatsappIsConfigured) return `mailto:${site.contact.email}`;
  return whatsappUrl(
    subject
      ? `Olá, Victor. Vim pelo site da Acássium Invest e queria entender melhor ${subject}.`
      : "Olá, Victor. Vim pelo site da Acássium Invest, estava lendo sobre os produtos " +
          "de investimento e gostaria de conversar.",
  );
}

const firstName = site.advisor.name.split(" ")[0] ?? site.advisor.name;

export function WhatsAppButton({
  subject,
  className = "",
  children,
}: Topic & { className?: string; children?: React.ReactNode }) {
  return (
    <a
      href={href({ subject })}
      target={whatsappIsConfigured ? "_blank" : undefined}
      rel={whatsappIsConfigured ? "noopener noreferrer" : undefined}
      className={`group inline-flex items-center gap-3.5 bg-light px-8 py-4.5 text-base font-semibold text-[#060d10] transition-all duration-500 hover:bg-[#f0d9b4] hover:shadow-[0_0_50px_-8px_rgba(227,188,126,.6)] ${className}`}
    >
      <WhatsAppIcon className="size-5 transition-transform duration-500 group-hover:scale-110" />
      {children ?? (whatsappIsConfigured ? `Conversar com o ${firstName}` : site.contact.email)}
    </a>
  );
}

/**
 * A faixa que fecha uma página.
 *
 * `title` e `subject` mudam conforme o contexto: quem fechou o verbete do CRA
 * tem uma dúvida diferente de quem acabou de ler a home, e a conversa começa
 * melhor quando a primeira mensagem já diz sobre o quê.
 */
export function WhatsAppCTA({
  title = "Ficou com alguma dúvida?",
  subject,
  note,
}: Topic & { title?: string; note?: string }) {
  return (
    <section
      aria-labelledby="falar-title"
      className="relative overflow-hidden border-t border-edge-soft px-6 py-20 text-center sm:px-10 sm:py-24"
    >
      {/* A subida de volta à luz: informação embaixo, conversa em cima. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#060d10,#081a21_40%,#0c2530)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(62%_70%_at_50%_125%,rgba(227,188,126,.26),transparent_74%)]"
      />

      <div className="relative mx-auto max-w-2xl">
        <p className="tech text-light">Falar com uma pessoa</p>

        <h2 id="falar-title" className="mt-6 text-[clamp(1.8rem,4.4vw,2.8rem)] leading-[1.06]">
          {title}
        </h2>

        <p className="mx-auto mt-6 max-w-[48ch] text-lg leading-relaxed text-aux">
          {note ??
            `Se precisa de apoio ou quer falar um pouco mais sobre investimentos, converse com o ${site.advisor.name} — ${site.advisor.role.toLowerCase()} na ${site.advisor.firm}.`}
        </p>

        <div className="mt-10">
          <WhatsAppButton subject={subject}>
            {whatsappIsConfigured
              ? `Falar com o ${firstName} no WhatsApp`
              : site.contact.email}
          </WhatsAppButton>
        </div>

        <p className="mx-auto mt-8 max-w-[52ch] text-sm leading-relaxed text-tertiary">
          O atendimento de assessoria acontece fora deste site, sob a regulamentação
          aplicável à atividade e à instituição. Este site é conteúdo educativo e não
          constitui recomendação de investimento.
        </p>
      </div>
    </section>
  );
}

/**
 * A versão discreta, para o meio da leitura.
 *
 * Uma linha só. Existe para que o convite esteja sempre a um clique sem que a
 * página vire um anúncio a cada rolagem.
 */
export function WhatsAppStrip({ subject, label }: Topic & { label?: string }) {
  return (
    <a
      href={href({ subject })}
      target={whatsappIsConfigured ? "_blank" : undefined}
      rel={whatsappIsConfigured ? "noopener noreferrer" : undefined}
      className="group flex flex-wrap items-center justify-between gap-4 border border-edge bg-inset px-6 py-5 transition-colors duration-300 hover:border-light/50"
    >
      <span className="flex items-center gap-3.5 text-base text-aux">
        <WhatsAppIcon className="size-5 shrink-0 text-light" />
        {label ?? "Alguma dúvida sobre o que está lendo? Fale comigo no WhatsApp."}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-light transition-transform duration-300 group-hover:translate-x-1">
        Conversar →
      </span>
    </a>
  );
}
