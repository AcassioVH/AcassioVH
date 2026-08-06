import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Wordmark } from "@/components/brand/Wordmark";
import { DisclaimerBar } from "@/components/ui/Disclaimer";
import { logoutAction } from "@/lib/auth/actions";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  // Carteira é dado financeiro sensível: nunca indexada, nunca pré-visualizada.
  robots: { index: false, follow: false, nocache: true },
};

const NAV = [
  { href: "/carteira", label: "Minha carteira" },
  { href: "/conta", label: "Conta e dados" },
] as const;

/** Iniciais para o marcador de conta no cabeçalho. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  return (
    <div className="flex min-h-[100svh] flex-col bg-ground">
      <header className="border-b border-edge-soft bg-inset">
        <nav
          aria-label="Navegação da conta"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10"
        >
          <div className="flex flex-wrap items-center gap-8">
            <Link href="/carteira" aria-label="Acássium Invest">
              <Wordmark size={22} />
            </Link>
            <ul className="flex gap-6">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-base text-tertiary transition-colors duration-200 hover:text-title"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center bg-edge font-mono text-[11px] text-light"
            >
              {initials(user.name)}
            </span>
            <span className="sr-only">Conectado como {user.name}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border border-edge px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-tertiary transition-colors duration-200 hover:border-light/60 hover:text-light"
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>

      <main className="flex-1 px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <DisclaimerBar />
    </div>
  );
}
