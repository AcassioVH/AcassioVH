"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Wordmark } from "@/components/brand/Wordmark";

const LINKS = [
  { href: "/#familias", label: "Quem paga você" },
  { href: "/#produtos", label: "Produtos" },
  { href: "/#comparar", label: "Comparar" },
  { href: "/#limite", label: "Nosso limite" },
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
          <ul className="hidden items-center gap-7 md:flex">
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

          <Link
            href="/#contato"
            className="bg-light px-4 py-2.5 text-sm font-semibold text-[#060D10] transition-colors duration-200 hover:bg-[#F0D9B4]"
          >
            Falar no WhatsApp
          </Link>
        </div>
      </nav>
    </header>
  );
}
