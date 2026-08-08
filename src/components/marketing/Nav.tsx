"use client";

/**
 * A barra fixa — agora a navegação inteira do site.
 *
 * Ela era uma lista de atalhos: três categorias escolhidas por frequência de
 * busca, e as outras três só a partir da home. Quem entrasse por um verbete
 * — que é como quase todo mundo chega, vindo de uma busca — ficava sem ver o
 * mapa: não havia "voltar ao início" escrito em lugar nenhum, e metade das
 * categorias não existia no topo.
 *
 * Agora o topo carrega tudo, na ordem em que se pergunta:
 *
 *   Acássium Invest · Início · Categorias ▾ · Instituições financeiras ▾ · ⌕
 *
 * **Por que painel, e não lista.** Seis categorias e onze tipos de instituição
 * não cabem em linha, e uma linha de rótulos soltos não diz o que há atrás de
 * cada um. O painel abre com o resumo de uma frase ao lado de cada destino —
 * quem passa o mouse já lê o que vai encontrar antes de clicar, que é a mesma
 * promessa que o site faz em toda página.
 *
 * **Passar o mouse abre; o teclado e o toque também.** Hover sozinho exclui
 * quem navega por teclado e quem está no celular. O gatilho é um `<button>` com
 * `aria-expanded`: abre no hover, abre no foco, alterna no clique, fecha no
 * `Esc` e fecha ao sair — com um respiro de 140 ms, para que atravessar a
 * diagonal até o painel não o feche na metade do caminho.
 *
 * **Sem botão de WhatsApp aqui.** Ele existia, e saiu: no telefone, disputava a
 * largura com a marca e empurrava a navegação inteira para fora da tela — o
 * primeiro elemento do site virava um anúncio. O convite continua em todas as
 * páginas, mas nos lugares onde ele responde a uma dúvida real: a faixa no meio
 * da leitura, a chamada que fecha cada página e o rodapé.
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Wordmark } from "@/components/brand/Wordmark";
import { SearchPalette } from "@/components/experience/SearchPalette";
import { CATEGORIES } from "@/domain/assets/destinations";
import { INSTITUTION_GROUPS, kindsOf } from "@/domain/institutions/kinds";

type MenuId = "categorias" | "instituicoes";

/** Tempo entre sair do gatilho e o painel fechar. Cobre o trajeto do ponteiro. */
const RESPIRO_MS = 140;

function Chevron({ aberto }: { aberto: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="ml-1.5 inline-block font-mono text-[9px] transition-transform duration-300"
      style={{ transform: aberto ? "rotate(180deg)" : "none" }}
    >
      ▾
    </span>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [drawer, setDrawer] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parado = useReducedMotion();
  const rota = usePathname();

  /**
   * Fecha ao navegar — ajustando o estado no render, sem efeito.
   *
   * Clicar num item já fecha o painel, mas voltar pelo botão do navegador com
   * ele aberto o deixaria por cima da página nova. Um `useEffect` que chama
   * `setState` roda depois da pintura: o painel antigo pisca sobre o conteúdo
   * novo por um quadro.
   */
  const [rotaAnterior, setRotaAnterior] = useState(rota);
  if (rota !== rotaAnterior) {
    setRotaAnterior(rota);
    setMenu(null);
    setDrawer(false);
  }

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu(null);
      setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function abrir(id: MenuId) {
    if (timer.current) clearTimeout(timer.current);
    setMenu(id);
  }

  function fecharComRespiro() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMenu(null), RESPIRO_MS);
  }

  // A barra ganha fundo sólido quando um painel está aberto, mesmo no topo da
  // página: painel translúcido sobre a atmosfera não se lê.
  const opaca = scrolled || menu !== null || drawer;

  const painel = {
    inicial: parado ? {} : { opacity: 0, y: -8 },
    visivel: { opacity: 1, y: 0 },
    saida: parado ? {} : { opacity: 0, y: -8 },
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        opaca ? "border-edge-soft bg-inset/95 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      {/*
        Véu de legibilidade, só enquanto a barra está sobre a atmosfera.

        No topo da página a barra é transparente, e embaixo dela passa a parte
        mais clara da composição — a superfície da água vista por baixo. Sem este
        degradê, os links caem sobre as cristas e o contraste some justamente no
        primeiro elemento que a pessoa vê.
      */}
      {!opaca ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[130%] bg-[linear-gradient(to_bottom,rgba(4,8,9,.72),rgba(4,8,9,.45)_55%,transparent)]"
        />
      ) : null}

      <nav
        aria-label="Navegação principal"
        className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10"
      >
        <Link href="/" aria-label="Acássium Invest — início" className="shrink-0">
          <Wordmark size={22} />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center lg:flex">
            <li>
              <Link
                href="/"
                className="block px-4 py-2 text-sm text-tertiary transition-colors duration-200 hover:text-title"
              >
                Início
              </Link>
            </li>

            <li
              onMouseEnter={() => abrir("categorias")}
              onMouseLeave={fecharComRespiro}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setMenu(null);
                }
              }}
            >
              <button
                type="button"
                aria-expanded={menu === "categorias"}
                aria-haspopup="true"
                onFocus={() => abrir("categorias")}
                onClick={() => setMenu(menu === "categorias" ? null : "categorias")}
                className={`px-4 py-2 text-sm transition-colors duration-200 hover:text-title ${
                  menu === "categorias" ? "text-title" : "text-tertiary"
                }`}
              >
                Categorias
                <Chevron aberto={menu === "categorias"} />
              </button>

              <AnimatePresence>
                {menu === "categorias" ? (
                  <motion.div
                    key="painel-categorias"
                    initial={painel.inicial}
                    animate={painel.visivel}
                    exit={painel.saida}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-0 top-full border-b border-edge-soft bg-inset/98 backdrop-blur-xl"
                  >
                    <div className="mx-auto max-w-6xl px-6 py-9 sm:px-10">
                      <p className="tech text-tertiary">Entrar por categoria</p>

                      <ul className="mt-6 grid grid-cols-3 gap-px">
                        {CATEGORIES.map((category) => (
                          <li key={category.id}>
                            <Link
                              href={`/categorias/${category.id}`}
                              onClick={() => setMenu(null)}
                              className="group flex h-full flex-col border border-edge bg-surface/40 p-5 transition-colors duration-300 hover:border-light/40 hover:bg-surface"
                            >
                              <span
                                aria-hidden="true"
                                className="block h-0.5 w-8"
                                style={{ background: category.accent }}
                              />
                              <span className="mt-4 text-base text-title">{category.label}</span>
                              <span className="mt-2 text-sm leading-relaxed text-muted">
                                {category.summary}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex flex-wrap gap-6 border-t border-edge-soft pt-5">
                        <Link
                          href="/comparar"
                          onClick={() => setMenu(null)}
                          className="font-mono text-[11px] uppercase tracking-[0.16em] text-light transition-colors duration-200 hover:text-title"
                        >
                          Comparar dois produtos →
                        </Link>
                        <Link
                          href="/#categorias"
                          onClick={() => setMenu(null)}
                          className="font-mono text-[11px] uppercase tracking-[0.16em] text-tertiary transition-colors duration-200 hover:text-light"
                        >
                          Ver as seis na home →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>

            <li
              onMouseEnter={() => abrir("instituicoes")}
              onMouseLeave={fecharComRespiro}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setMenu(null);
                }
              }}
            >
              <button
                type="button"
                aria-expanded={menu === "instituicoes"}
                aria-haspopup="true"
                onFocus={() => abrir("instituicoes")}
                onClick={() => setMenu(menu === "instituicoes" ? null : "instituicoes")}
                className={`px-4 py-2 text-sm transition-colors duration-200 hover:text-title ${
                  menu === "instituicoes" ? "text-title" : "text-tertiary"
                }`}
              >
                Instituições financeiras
                <Chevron aberto={menu === "instituicoes"} />
              </button>

              <AnimatePresence>
                {menu === "instituicoes" ? (
                  <motion.div
                    key="painel-instituicoes"
                    initial={painel.inicial}
                    animate={painel.visivel}
                    exit={painel.saida}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-0 top-full border-b border-edge-soft bg-inset/98 backdrop-blur-xl"
                  >
                    <div className="mx-auto max-w-6xl px-6 py-9 sm:px-10">
                      <p className="tech text-tertiary">
                        Quem emite, quem intermedeia, quem administra
                      </p>

                      <div className="mt-6 grid grid-cols-4 gap-px">
                        {INSTITUTION_GROUPS.map((group) => (
                          <div
                            key={group.id}
                            className="border border-edge bg-surface/40 p-5"
                          >
                            <span
                              aria-hidden="true"
                              className="block h-0.5 w-8"
                              style={{ background: group.accent }}
                            />
                            <p className="mt-4 text-sm leading-snug text-aux">{group.label}</p>
                            <ul className="mt-4 space-y-2.5">
                              {kindsOf(group).map((kind) => (
                                <li key={kind.id}>
                                  <Link
                                    href={`/instituicoes#${kind.id}`}
                                    onClick={() => setMenu(null)}
                                    className="block text-sm leading-snug text-muted transition-colors duration-200 hover:text-light"
                                  >
                                    {kind.short}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-6 border-t border-edge-soft pt-5">
                        <Link
                          href="/instituicoes"
                          onClick={() => setMenu(null)}
                          className="font-mono text-[11px] uppercase tracking-[0.16em] text-light transition-colors duration-200 hover:text-title"
                        >
                          Ver a página inteira →
                        </Link>
                        <Link
                          href="/instituicoes#conferir"
                          onClick={() => setMenu(null)}
                          className="font-mono text-[11px] uppercase tracking-[0.16em] text-tertiary transition-colors duration-200 hover:text-light"
                        >
                          Onde conferir uma instituição →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          </ul>

          <SearchPalette />

          {/* Em tela estreita não há hover: o mesmo conteúdo vira uma gaveta. */}
          <button
            type="button"
            aria-expanded={drawer}
            aria-controls="menu-estreito"
            onClick={() => setDrawer((atual) => !atual)}
            className="px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-light transition-colors duration-200 hover:text-title lg:hidden"
          >
            {drawer ? "Fechar" : "Menu"}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {drawer ? (
          <motion.div
            id="menu-estreito"
            initial={painel.inicial}
            animate={painel.visivel}
            exit={painel.saida}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-edge-soft bg-inset/98 px-6 py-8 backdrop-blur-xl sm:px-10 lg:hidden"
          >
            <Link
              href="/"
              onClick={() => setDrawer(false)}
              className="block border-b border-edge-soft pb-4 text-lg text-title"
            >
              Início
            </Link>

            <p className="tech mt-8 text-tertiary">Categorias</p>
            <ul className="mt-4 space-y-px">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categorias/${category.id}`}
                    onClick={() => setDrawer(false)}
                    className="flex items-center gap-3 border border-edge bg-surface/40 px-4 py-3 text-base text-body transition-colors duration-300 hover:border-light/40 hover:text-light"
                  >
                    <span
                      aria-hidden="true"
                      className="block h-0.5 w-5 shrink-0"
                      style={{ background: category.accent }}
                    />
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="tech mt-8 text-tertiary">Instituições financeiras</p>
            <ul className="mt-4 space-y-px">
              {INSTITUTION_GROUPS.map((group) => (
                <li key={group.id}>
                  <div className="border border-edge bg-surface/40 px-4 py-3">
                    <p className="text-sm leading-snug text-aux">{group.label}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                      {kindsOf(group).map((kind) => (
                        <li key={kind.id}>
                          <Link
                            href={`/instituicoes#${kind.id}`}
                            onClick={() => setDrawer(false)}
                            className="text-sm text-muted transition-colors duration-200 hover:text-light"
                          >
                            {kind.short}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 border-t border-edge-soft pt-6">
              <Link
                href="/instituicoes"
                onClick={() => setDrawer(false)}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-light"
              >
                Ver a página de instituições →
              </Link>
              <Link
                href="/comparar"
                onClick={() => setDrawer(false)}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-light"
              >
                Comparar dois produtos →
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
