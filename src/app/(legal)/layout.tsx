import Link from "next/link";

import { Wordmark } from "@/components/brand/Wordmark";
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
        <Link href="/" aria-label="Acássium Invest">
          <Wordmark size={20} />
        </Link>

        <article className="mt-12">{children}</article>

        <footer className="mt-16 border-t border-edge-soft pt-8">
          <p className="font-mono text-[11px] text-muted">
            Última revisão: {site.legal.updatedAt}.
          </p>
          <nav className="mt-4 flex gap-6 text-base">
            <Link href="/termos" className="text-light underline-offset-4 hover:underline">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-light underline-offset-4 hover:underline">
              Política de Privacidade
            </Link>
          </nav>
          <Disclaimer variant="full" className="mt-8" />
        </footer>
      </div>
    </div>
  );
}
