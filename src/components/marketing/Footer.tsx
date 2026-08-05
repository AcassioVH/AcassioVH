import Link from "next/link";

import { Disclaimer } from "@/components/ui/Disclaimer";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-blue/25 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="font-serif text-lg">
              Acássium <span className="text-gold">Invest</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-200">{site.tagline}</p>
          </div>

          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-blue-200">
              <li>
                <a href="#composicao" className="transition-colors hover:text-gold">
                  Composição
                </a>
              </li>
              <li>
                <a href="#ativos" className="transition-colors hover:text-gold">
                  Ativos
                </a>
              </li>
              <li>
                <a href="#seguranca" className="transition-colors hover:text-gold">
                  Segurança
                </a>
              </li>
              <li>
                <a href="#limite" className="transition-colors hover:text-gold">
                  Nosso limite
                </a>
              </li>
              <li>
                <a href="#contato" className="transition-colors hover:text-gold">
                  Contato
                </a>
              </li>
              <li>
                <Link href="/termos" className="transition-colors hover:text-gold">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="transition-colors hover:text-gold">
                  Privacidade
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div aria-hidden="true" className="rule-fade my-10" />

        <Disclaimer variant="full" className="max-w-4xl" />

        <p className="mt-8 text-xs text-blue-200/50">
          © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
