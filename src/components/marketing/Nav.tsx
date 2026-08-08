"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/brand/Wordmark";
import { SearchPalette } from "@/components/experience/SearchPalette";

/**
 * A barra fixa.
 *
 * Os links são as três categorias que a maioria das pessoas procura por nome —
 * as outras três ficam a um clique em "Todas". Não é hierarquia de mérito: é
 * frequência de busca.
 *
 * **Sem botão de WhatsApp aqui.** Ele existia, e saiu: no telefone, disputava a
 * largura com a marca e empurrava a navegação inteira para fora da tela — o
 * primeiro elemento do site virava um anúncio. O convite continua em todas as
 * páginas, mas nos lugares onde ele responde a uma dúvida real: a faixa no meio
 * da leitura, a chamada que fecha cada página e o rodapé. Convite vale quando
 * chega depois da explicação, não antes dela.
 *
 * **A busca ocupa o lugar que era do botão**, e ganha a prioridade por um motivo
 * simples: com 36 verbetes, quem já sabe a palavra que procura não deveria ter
 * de adivinhar em qual categoria ela mora.
 */
const LINKS = [
  { href: "/categorias/renda-fixa", label: "Renda fixa" },
  { href: "/categorias/renda-variavel", label: "Renda variável" },
  { href: "/categorias/internacional", label: "Internacional" },
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
      {/*
        Véu de legibilidade, só enquanto a barra está sobre a atmosfera.

        No topo da página a barra é transparente, e embaixo dela passa a parte
        mais clara da composição — a superfície da água vista por baixo. Sem este
        degradê, os links caem sobre as cristas e o contraste some justamente no
        primeiro elemento que a pessoa vê. Ele escurece o suficiente para o texto
        e vai a zero antes de alcançar a onda, que continua legível como onda.
      */}
      {!scrolled ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[130%] bg-[linear-gradient(to_bottom,rgba(4,8,9,.72),rgba(4,8,9,.45)_55%,transparent)]"
        />
      ) : null}

      <nav
        aria-label="Navegação principal"
        className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-10"
      >
        <Link href="/" aria-label="Acássium Invest — início">
          <Wordmark size={22} />
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-7 lg:flex">
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

          {/* Em tela estreita, um destino só: a lista de categorias. */}
          <Link
            href="/#categorias"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-light transition-colors duration-200 hover:text-title lg:hidden"
          >
            Categorias
          </Link>

          <SearchPalette />
        </div>
      </nav>
    </header>
  );
}
