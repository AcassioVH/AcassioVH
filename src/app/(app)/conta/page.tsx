import type { Metadata } from "next";

import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import { getSessionUser } from "@/lib/auth/session";
import { loadPortfolio } from "@/lib/portfolio/actions";

export const metadata: Metadata = { title: "Conta e dados" };

/**
 * Conta e dados — direitos da LGPD.
 *
 * Os artigos 18 e 19 dão ao titular o direito de acessar, portar e eliminar
 * seus dados. Tratamos isso como funcionalidade de produto, com botão visível,
 * e não como procedimento por e-mail: direito que depende de abrir chamado é
 * direito com atrito desenhado para não ser exercido.
 */
export default async function AccountPage() {
  const user = await getSessionUser();
  const assets = await loadPortfolio();

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="text-3xl sm:text-4xl">Conta e dados</h1>
        <p className="mt-3 text-sm text-blue-200">
          O que guardamos sobre você, e como levar embora ou apagar.
        </p>
      </header>

      <section className="surface rounded-2xl p-8">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-gold">
          Seus dados
        </h2>
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between gap-4 border-b border-blue/20 pb-3">
            <dt className="text-blue-200">Nome</dt>
            <dd className="text-mist">{user?.name}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-blue/20 pb-3">
            <dt className="text-blue-200">E-mail</dt>
            <dd className="text-mist">{user?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-blue-200">Ativos declarados</dt>
            <dd className="text-mist">{assets.length}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-blue-200/70">
          Guardamos apenas o que você declarou: nome, e-mail, senha em forma de hash
          argon2id, e os ativos que você informou. Não armazenamos rentabilidade, cotação
          ou histórico de preço — nem sobre você, nem sobre seus ativos.
        </p>
      </section>

      <section className="surface rounded-2xl p-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-gold">
          Exportar seus dados
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-blue-200">
          Baixe tudo o que temos sobre você em JSON, em formato legível por máquina —
          direito à portabilidade previsto na LGPD.
        </p>
        <a
          href="/api/conta/exportar"
          download
          className="inline-block rounded-full border border-gold/40 px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-navy"
        >
          Baixar meus dados (JSON)
        </a>
      </section>

      <section className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-gold">
          Excluir conta e dados
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-blue-200">
          A exclusão é imediata e definitiva: conta, sessões e todos os ativos declarados
          são apagados do banco de uma vez. Não mantemos cópia nem período de carência, e
          não há como desfazer.
        </p>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
