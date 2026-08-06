"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/brand/Wordmark";
import { WhatsAppIcon } from "@/components/ui/WhatsAppCTA";
import { site, whatsappIsConfigured, whatsappUrl } from "@/config/site";

/**
 * A barra fixa.
 *
 * Os links são as três categorias que a maioria das pessoas procura por nome —
 * as outras três ficam a um clique em "Todas". Não é hierarquia de mérito: é
 * frequência de busca.
 *
 * O botão do WhatsApp abre a conversa direto, de qualquer página. Ele apontava
 * para a âncora `#contato` da home, o que fazia com que, lendo o verbete de um
 * produto, o botão de falar levasse a rolar outra página em vez de abrir a
 * conversa.
 */
const LINKS = [
  { href: "/categorias/renda-fixa", label: "Renda fixa" },
  { href: "/categorias/renda-variavel", label: "Renda variável" },
  { href: "/categorias/internacional", label: "Internacional" },
  { href: "/#categorias", label: "Todas" },
  { href: "/comparar", label: "Comparar" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-edge-soft bg-inset/95 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-10"
      >
        <Link href="/" aria-label="Acássium Invest — início">
          <Wordmark size={22} />
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 lg:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-tertiary transition-colors duration-200 hover:text-title"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={
              whatsappIsConfigured
                ? whatsappUrl(
                    "Olá, Victor. Vim pelo site da Acássium Invest e gostaria de conversar " +
                      "sobre investimentos.",
                  )
                : `mailto:${site.contact.email}`
            }
            target={whatsappIsConfigured ? "_blank" : undefined}
            rel={whatsappIsConfigured ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2.5 bg-light px-4 py-2.5 text-sm font-semibold text-[#060D10] transition-colors duration-200 hover:bg-[#F0D9B4]"
          >
            <WhatsAppIcon className="size-4" />
            <span className="hidden sm:inline">Falar no WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
