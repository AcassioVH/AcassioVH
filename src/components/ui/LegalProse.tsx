import type { ReactNode } from "react";

import { site } from "@/config/site";

export function LegalTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-3xl sm:text-4xl">{children}</h1>;
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl text-gold">{title}</h2>
      <div className="space-y-4 text-sm leading-relaxed text-blue-200">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: readonly ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Identificação do controlador, ou um marcador visível quando não preenchida.
 *
 * O marcador é deliberadamente feio: uma pendência legal que fica discreta na
 * tela é uma pendência que vai para produção sem ninguém notar.
 */
export function ControllerIdentification() {
  const { entityName, entityDocument } = site.legal;

  if (!entityName || !entityDocument) {
    return (
      <span className="rounded bg-gold/20 px-2 py-0.5 font-medium text-gold">
        [razão social, CNPJ e endereço do controlador — a preencher antes de publicar]
      </span>
    );
  }

  return (
    <span className="text-mist">
      {entityName}, inscrita no CNPJ sob o nº {entityDocument}
    </span>
  );
}

/**
 * Aviso de que o texto ainda não passou por revisão jurídica.
 *
 * Some sozinho quando `NEXT_PUBLIC_LEGAL_REVIEWED` for definida — o mesmo ato
 * de registrar que a revisão aconteceu é o que retira o aviso da tela.
 */
export function PendingLegalReviewNotice() {
  if (process.env.NEXT_PUBLIC_LEGAL_REVIEWED === "true") return null;

  return (
    <p className="mt-8 rounded-xl border border-gold/40 bg-gold/[0.06] p-5 text-sm leading-relaxed text-gold">
      <strong className="font-semibold">Documento em elaboração.</strong> Este texto
      descreve com precisão o funcionamento atual do sistema, mas ainda não passou por
      revisão de advogado. Não deve ser tratado como instrumento jurídico definitivo até
      que essa revisão ocorra.
    </p>
  );
}
