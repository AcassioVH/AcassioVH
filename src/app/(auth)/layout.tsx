import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Disclaimer } from "@/components/ui/Disclaimer";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  // Telas de conta não devem aparecer em busca.
  robots: { index: false, follow: false },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Quem já está autenticado não tem o que fazer no login.
  if (await getSessionUser()) redirect("/carteira");

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[radial-gradient(ellipse_at_50%_0%,#16345c_0%,#0b1f3a_60%)] px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 block text-center font-serif text-xl">
          Acássium <span className="text-gold">Invest</span>
        </Link>

        <div className="surface rounded-2xl p-8 sm:p-10">{children}</div>

        <Disclaimer className="mt-8 text-center" />
      </div>
    </main>
  );
}
