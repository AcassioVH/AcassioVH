"use client";

/**
 * A busca — a superfície mais interativa do site.
 *
 * Com 36 verbetes, quem já conhece a palavra "debênture" não deveria precisar
 * adivinhar em qual categoria ela mora. A busca é o atalho de quem sabe o que
 * procura, e a navegação continua sendo o caminho de quem não sabe.
 *
 * **O gesto é o do site.** A paleta não desliza de cima como um menu: ela emerge
 * do fundo e sobe, com a água escurecendo atrás — a mesma figura da descida,
 * invertida. Cada resultado sobe com um atraso próprio, como bolha.
 *
 * **O que ela não faz.** Não ordena por mérito, não sugere produto e não tem
 * "mais procurados": ranking de busca viraria ranking de produto, que é
 * exatamente o que o site não emite. A ordenação é por qualidade do casamento
 * com o que foi digitado, e o estado vazio mostra as categorias — a porta, não
 * uma seleção.
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CATEGORIES } from "@/domain/assets/destinations";
import { search, SEARCH_INDEX, type SearchEntry } from "@/domain/assets/search";

const VAZIO: SearchEntry[] = CATEGORIES.map((category) => ({
  kind: "categoria" as const,
  id: category.id,
  href: `/categorias/${category.id}`,
  title: category.label,
  badge: null,
  detail: category.summary,
  accent: category.accent,
  haystack: [],
}));

/**
 * O que ocupa a coluna da sigla quando o resultado não tem sigla.
 *
 * A coluna existe para alinhar: sem ela, título de produto e título de
 * categoria começam em colunas diferentes e a lista fica serrilhada. O rótulo
 * diz que tipo de resultado é aquele — e "Porta" em cima de "Corretora e
 * distribuidora" diria a coisa errada.
 */
const ROTULO_SEM_SIGLA: Record<SearchEntry["kind"], string> = {
  categoria: "Porta",
  instituicao: "Quem",
  produto: "Ficha",
};

/** Quantos verbetes de produto existem — a conta que o estado vazio mostra. */
const TOTAL_DE_PRODUTOS = SEARCH_INDEX.filter((entry) => entry.kind === "produto").length;

export function SearchPalette() {
  const [aberta, setAberta] = useState(false);
  const [termo, setTermo] = useState("");
  const [ativo, setAtivo] = useState(0);
  const parado = useReducedMotion();
  const campo = useRef<HTMLInputElement>(null);
  const rota = usePathname();

  const resultados = useMemo(() => (termo.trim() ? search(termo) : VAZIO), [termo]);

  const fechar = useCallback(() => {
    setAberta(false);
    setTermo("");
    setAtivo(0);
  }, []);

  /**
   * Fecha ao navegar — sem efeito.
   *
   * Clicar num resultado já fecha a paleta, mas voltar pelo botão do navegador
   * com ela aberta a deixaria por cima da página nova. A primeira versão
   * resolvia isso num `useEffect`, que dispara render em cascata: o React
   * pinta a paleta aberta e só depois a fecha.
   *
   * Este é o ajuste de estado durante a renderização, que o React prevê para
   * exatamente este caso — ele reinicia o render antes de pintar, então a
   * paleta nunca chega à tela na rota errada.
   */
  const [rotaAnterior, setRotaAnterior] = useState(rota);
  if (rota !== rotaAnterior) {
    setRotaAnterior(rota);
    setAberta(false);
    setTermo("");
    setAtivo(0);
  }

  useEffect(() => {
    function atalho(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberta((v) => !v);
      }
      // A barra é o atalho que a maioria conhece de outros produtos, mas só
      // vale quando o foco não está num campo — senão impede digitar "/".
      const alvo = e.target as HTMLElement | null;
      const digitando = alvo?.tagName === "INPUT" || alvo?.tagName === "TEXTAREA";
      if (e.key === "/" && !digitando) {
        e.preventDefault();
        setAberta(true);
      }
      if (e.key === "Escape") fechar();
    }
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, [fechar]);

  useEffect(() => {
    if (!aberta) return;
    campo.current?.focus();
    // Trava a rolagem de fundo enquanto a paleta está aberta.
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberta]);

  function navegarPorTeclado(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtivo((i) => (i + 1) % Math.max(resultados.length, 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((i) => (i - 1 + resultados.length) % Math.max(resultados.length, 1));
    }
    if (e.key === "Enter") {
      const escolhido = resultados[ativo];
      if (escolhido) window.location.href = escolhido.href;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        aria-label="Buscar produto ou categoria"
        className="group flex items-center gap-2.5 border border-edge px-3 py-2 text-tertiary transition-colors duration-200 hover:border-light/50 hover:text-title"
      >
        <Lupa className="size-4" />
        <span className="hidden text-sm sm:inline">Buscar</span>
        <kbd className="hidden border border-edge-soft px-1.5 py-0.5 font-mono text-[10px] text-muted transition-colors group-hover:text-tertiary lg:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {aberta ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: parado ? 0.1 : 0.25 }}
          >
            {/* A água que fecha atrás: escurece o conteúdo sem apagá-lo. */}
            <button
              aria-label="Fechar busca"
              onClick={fechar}
              className="absolute inset-0 cursor-default bg-abyss/80 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Buscar no catálogo"
              className="relative w-full max-w-2xl border border-edge bg-inset shadow-[0_40px_120px_-20px_rgba(0,0,0,.8)]"
              initial={parado ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={parado ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.99 }}
              transition={{ duration: parado ? 0.12 : 0.34, ease: [0.16, 1, 0.3, 1] }}
              onKeyDown={navegarPorTeclado}
            >
              {/* O fio de luz no alto da placa: a superfície, de novo. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(227,188,126,.6)_45%,transparent)]"
              />

              <div className="flex items-center gap-3 border-b border-edge-soft px-5">
                <Lupa className="size-4 shrink-0 text-light" />
                <input
                  ref={campo}
                  value={termo}
                  onChange={(e) => {
                    setTermo(e.target.value);
                    setAtivo(0);
                  }}
                  placeholder="CDB, agro, dólar, internacional…"
                  aria-label="Buscar produto ou categoria"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent py-4 text-lg text-title outline-none placeholder:text-muted"
                />
                <kbd className="hidden shrink-0 border border-edge-soft px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
                  esc
                </kbd>
              </div>

              <p className="sr-only" aria-live="polite">
                {termo.trim()
                  ? `${resultados.length} resultado${resultados.length === 1 ? "" : "s"}`
                  : `${VAZIO.length} categorias`}
              </p>

              <p className="tech border-b border-edge-soft px-5 py-2.5 text-muted">
                {termo.trim() ? "Resultados" : "Comece por uma categoria"}
              </p>

              <ul className="max-h-[52vh] overflow-y-auto">
                {resultados.map((item, i) => (
                  <motion.li
                    key={`${item.kind}-${item.id}`}
                    initial={parado ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: parado ? 0 : i * 0.028, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      onMouseEnter={() => setAtivo(i)}
                      onClick={fechar}
                      className={`flex items-center gap-4 border-l-2 px-5 py-3.5 transition-colors duration-150 ${
                        i === ativo ? "bg-surface/80" : "border-transparent"
                      }`}
                      style={{ borderLeftColor: i === ativo ? item.accent : "transparent" }}
                    >
                      {item.badge ? (
                        <span
                          className="w-14 shrink-0 font-mono text-[11px] uppercase tracking-[0.12em]"
                          style={{ color: item.accent }}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted"
                        >
                          {ROTULO_SEM_SIGLA[item.kind]}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base text-title">{item.title}</span>
                        <span className="block truncate text-sm text-tertiary">{item.detail}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`shrink-0 font-mono text-xs transition-opacity ${
                          i === ativo ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ color: item.accent }}
                      >
                        ↵
                      </span>
                    </Link>
                  </motion.li>
                ))}

                {resultados.length === 0 ? (
                  <li className="px-5 py-10 text-center">
                    <p className="text-base text-aux">
                      Nada com <span className="text-title">{termo}</span> no catálogo.
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      São {TOTAL_DE_PRODUTOS} produtos — tente a sigla, para onde o dinheiro vai,
                      ou o tipo de instituição.
                    </p>
                  </li>
                ) : null}
              </ul>

              <p className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-edge-soft px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                <span>↑↓ navegar</span>
                <span>↵ abrir</span>
                <span>esc fechar</span>
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function Lupa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
