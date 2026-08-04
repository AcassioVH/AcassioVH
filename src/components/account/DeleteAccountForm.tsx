"use client";

import { useState } from "react";

import { deleteAccountAction } from "@/lib/auth/actions";

const CONFIRMATION = "EXCLUIR";

/**
 * Confirmação por digitação em vez de `confirm()` do navegador.
 *
 * A ação é irreversível, então o atrito é proposital: digitar a palavra exige
 * uma intenção que clicar em "OK" por reflexo não exige. Sem modal nativo, que
 * além de feio é fácil de despachar sem ler.
 */
export function DeleteAccountForm() {
  const [confirmation, setConfirmation] = useState("");
  const armed = confirmation.trim().toUpperCase() === CONFIRMATION;

  return (
    <form action={deleteAccountAction} className="space-y-4">
      <label htmlFor="confirmacao" className="block text-sm text-blue-200">
        Para confirmar, digite <span className="font-semibold text-gold">{CONFIRMATION}</span>
      </label>
      <input
        id="confirmacao"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        autoComplete="off"
        className="w-full max-w-xs rounded-xl border border-blue/40 bg-navy-800/60 px-4 py-3 text-base text-mist focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        disabled={!armed}
        className="block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Excluir minha conta e meus dados
      </button>
    </form>
  );
}
