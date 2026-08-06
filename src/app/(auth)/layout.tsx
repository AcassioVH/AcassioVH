import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Wordmark } from "@/components/brand/Wordmark";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Quem já está autenticado não tem o que fazer no login.
  if (await getSessionUser()) redirect("/carteira");

  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-16">
      {/* Mesma coluna d'água do hero, mais contida. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#0E2B34_0%,#081A21_46%,#060D10_100%)]"
      />
      <div aria-hidden="true" className="beam absolute inset-x-0 top-0 h-0.5" />
      <div
        aria-hidden="true"
        className="shaft absolute left-[58%] top-[-60px] h-[520px] w-[140px] skew-x-[-10deg]"
      />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-10 flex justify-center" aria-label="Acássium Invest">
          <Wordmark variant="full" size={20} />
        </Link>

        <div className="border border-edge bg-surface p-8 sm:p-10">{children}</div>

        <Disclaimer className="mt-8 text-center" />
      </div>
    </main>
  );
}
