import Link from "next/link";

import { Disclaimer } from "@/components/ui/Disclaimer";
import { site } from "@/config/site";

/**
 * Moldura das páginas legais.
 *
 * Públicas e indexáveis de propósito: documento de tratamento de dados que só
 * aparece depois do login não cumpre a função de informar antes do cadastro.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-serif text-lg">
          Acássium <span className="text-gold">Invest</span>
        </Link>

        <article className="mt-12">{children}</article>

        <footer className="mt-16 border-t border-blue/25 pt-8">
          <p className="text-xs text-blue-200/60">
            Última revisão: {site.legal.updatedAt}.
          </p>
          <nav className="mt-4 flex gap-6 text-sm">
            <Link href="/termos" className="text-gold underline-offset-4 hover:underline">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-gold underline-offset-4 hover:underline">
              Política de Privacidade
            </Link>
          </nav>
          <Disclaimer variant="full" className="mt-8" />
        </footer>
      </div>
    </div>
  );
}
