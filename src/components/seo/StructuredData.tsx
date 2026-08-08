/**
 * Dados estruturados — o que o site declara aos buscadores sobre si mesmo.
 *
 * **A escolha do schema aqui é decisão de conformidade, não de SEO.**
 *
 * O vocabulário schema.org tem o tipo `FinancialProduct`, e usá-lo seria a
 * escolha automática para páginas sobre CDB e CRA. Ele está errado para este
 * site, e errado de um jeito que importa: `FinancialProduct` descreve um produto
 * **oferecido por quem publica a página**, e admite campos de taxa de juros,
 * taxa anual e condições. Declará-lo faria o site afirmar, em linguagem
 * legível por máquina, que oferece aqueles produtos — exatamente o que a
 * Resolução CVM 19 nos obriga a não fazer.
 *
 * O tipo correto é `DefinedTerm` dentro de um `DefinedTermSet`: um verbete de
 * glossário. É o que o site é — um dicionário —, e é o que ele faz: define
 * termos, não oferece instrumentos.
 *
 * Pela mesma razão a organização é `Organization`, e não `FinancialService`.
 * O atendimento de assessoria acontece fora daqui, sob a regulamentação
 * aplicável à instituição, e o site não é o canal desse serviço.
 */

import { site } from "@/config/site";
import { CATALOG_REVIEWED_AT } from "@/domain/assets/profiles";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // O conteúdo é gerado por nós a partir de dados tipados do domínio, nunca
      // de entrada de usuário — não há caminho por onde injetar script aqui.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** O glossário como um todo. Vai na home. */
export function GlossarioJsonLd({ termos }: { termos: number }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: site.url,
          description: site.description,
          knowsLanguage: "pt-BR",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "@id": `${site.url}/#glossario`,
          name: `${site.name} — produtos de investimento`,
          description: site.description,
          url: site.url,
          inLanguage: "pt-BR",
          hasDefinedTerm: { "@type": "DefinedTerm", name: `${termos} verbetes` },
          dateModified: CATALOG_REVIEWED_AT,
        }}
      />
    </>
  );
}

/** Um verbete. Vai na página do produto. */
export function VerbeteJsonLd({
  termo,
  nomeCompleto,
  definicao,
  url,
}: {
  termo: string;
  nomeCompleto: string;
  definicao: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: nomeCompleto,
        alternateName: termo,
        description: definicao,
        url,
        inLanguage: "pt-BR",
        inDefinedTermSet: `${site.url}/#glossario`,
        dateModified: CATALOG_REVIEWED_AT,
      }}
    />
  );
}

/**
 * A trilha de navegação.
 *
 * Faz o buscador exibir "Acássium Invest › Renda fixa › CDB" em vez da URL
 * crua, e é a única forma de a hierarquia de três níveis do site aparecer no
 * resultado da busca.
 */
export function TrilhaJsonLd({ itens }: { itens: readonly { nome: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: itens.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.nome,
          item: item.url,
        })),
      }}
    />
  );
}
