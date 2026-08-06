import Link from "next/link";

import { Wordmark } from "@/components/brand/Wordmark";
import { site } from "@/config/site";

const LINKS = [
  { href: "/#familias", label: "Quem paga você" },
  { href: "/#produtos", label: "Produtos" },
  { href: "/#comparar", label: "Comparar estruturas" },
  { href: "/#limite", label: "Nosso limite" },
  { href: "/#contato", label: "Contato" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-edge-soft bg-abyss px-6 py-14 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Wordmark variant="full" size={18} />
            <p className="mt-5 max-w-sm text-base leading-relaxed text-tertiary">{site.tagline}</p>
          </div>

          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-base text-tertiary">
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
