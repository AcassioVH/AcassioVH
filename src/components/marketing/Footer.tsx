import Link from "next/link";

import { Wordmark } from "@/components/brand/Wordmark";
import { WhatsAppIcon } from "@/components/ui/WhatsAppCTA";
import { site, whatsappIsConfigured, whatsappUrl } from "@/config/site";
import { CATEGORIES } from "@/domain/assets/destinations";

const LINKS = [
  { href: "/#o-que-e", label: "O que é este site" },
  { href: "/instituicoes", label: "Instituições financeiras" },
  { href: "/comparar", label: "Comparar produtos" },
  { href: "/#limite", label: "Nosso limite" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-edge-soft bg-abyss px-6 py-14 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Wordmark variant="full" size={18} />
            <p className="mt-5 max-w-sm text-base leading-relaxed text-tertiary">{site.tagline}</p>

            {/* O convite também aqui: o rodapé é a última coisa da página, e
                quem chegou até ele já leu tudo o que tínhamos a explicar. */}
            <a
              href={
                whatsappIsConfigured
                  ? whatsappUrl(
                      "Olá, Victor. Vim pelo site da Acássium Invest e gostaria de conversar.",
                    )
                  : `mailto:${site.contact.email}`
              }
              target={whatsappIsConfigured ? "_blank" : undefined}
              rel={whatsappIsConfigured ? "noopener noreferrer" : undefined}
              className="mt-7 inline-flex items-center gap-3 border border-light/35 px-5 py-3 text-base text-light transition-colors duration-300 hover:border-light hover:bg-light hover:text-[#060d10]"
            >
              <WhatsAppIcon className="size-4" />
              {whatsappIsConfigured ? "Falar no WhatsApp" : site.contact.email}
            </a>
          </div>

          <nav aria-label="Rodapé" className="grid gap-10 sm:grid-cols-2">
            {/* As categorias listadas no rodapé, e não escondidas atrás da home:
                é aqui que quem chegou por busca direta a um verbete descobre que
                existe o resto do site. */}
            <div>
              <p className="tech mb-4 text-muted">Categorias</p>
              <ul className="space-y-2.5 text-base text-tertiary">
                {CATEGORIES.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categorias/${category.id}`}
                      className="transition-colors duration-200 hover:text-light"
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="tech mb-4 text-muted">O site</p>
              <ul className="flex flex-col gap-2.5 text-base text-tertiary">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors duration-200 hover:text-light">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/termos" className="transition-colors duration-200 hover:text-light">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="transition-colors duration-200 hover:text-light"
                >
                  Privacidade
                </Link>
              </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-edge-soft pt-6 font-mono text-[11px] leading-relaxed tracking-wide text-muted sm:flex-row">
          <span>ACÁSSIUM INVEST · PLATAFORMA DESCRITIVA DE ATIVOS · MACEIÓ, AL</span>
          <span>Conteúdo baseado em registros públicos. Não constitui recomendação de investimento.</span>
        </div>

        <p className="mt-5 font-mono text-[11px] text-muted">
          © {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}
