"use client";

import { useEffect, useState } from "react";

import { site, whatsappUrl } from "@/config/site";

const LINKS = [
  { href: "#composicao", label: "Composição" },
  { href: "#ativos", label: "Ativos" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#limite", label: "Nosso limite" },
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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-blue/25 bg-navy/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"
      >
        <a href="#inicio" className="font-serif text-lg tracking-tight text-mist">
          Acássium <span className="text-gold">Invest</span>
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-blue-200 transition-colors duration-300 hover:text-gold"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-gold/40 px-5 py-2 text-sm font-medium text-gold transition-colors duration-300 hover:bg-gold hover:text-navy"
        >
          Falar com {site.advisor.name.split(" ")[0]}
        </a>
      </nav>
    </header>
  );
}
