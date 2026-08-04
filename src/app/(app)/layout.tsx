import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DisclaimerBar } from "@/components/ui/Disclaimer";
import { logoutAction } from "@/lib/auth/actions";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  // Carteira é dado financeiro sensível: nunca indexada, nunca pré-visualizada.
  robots: { index: false, follow: false, nocache: true },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="border-b border-blue/25 bg-navy-800/60 backdrop-blur">
        <nav
          aria-label="Navegação da conta"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4"
        >
          <div className="flex items-center gap-8">
            <Link href="/carteira" className="font-serif text-lg">
              Acássium <span className="text-gold">Invest</span>
            </Link>
            <Link
              href="/carteira"
              className="text-sm text-blue-200 transition-colors hover:text-gold"
            >
              Carteira
            </Link>
            <Link
              href="/conta"
              className="text-sm text-blue-200 transition-colors hover:text-gold"
            >
              Conta e dados
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden text-sm text-blue-200 sm:inline">{user.name}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-blue-200/30 px-4 py-1.5 text-sm text-blue-200 transition-colors hover:border-gold/60 hover:text-gold"
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <DisclaimerBar />
    </div>
  );
}
