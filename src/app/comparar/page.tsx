import type { Metadata } from "next";
import Link from "next/link";

import { ComparisonSection } from "@/components/marketing/ComparisonSection";
import { Footer } from "@/components/marketing/Footer";
import { Nav } from "@/components/marketing/Nav";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { CATEGORIES } from "@/domain/assets/families";

export const metadata: Metadata = {
  title: "Comparar produtos",
  description:
    "Dois tipos de produto lado a lado: para onde vai o dinheiro, quem emite, qual a garantia, " +
    "como funciona o resgate e qual a regra tributária.",
};

/**
 * A comparação ganhou endereço próprio.
 *
 * Ela estava no meio da home, onde só chegava quem rolasse até lá. Como
 * ferramenta, faz mais sentido ser um destino: dá para mandar o link de uma
 * comparação específica para alguém.
 *
 * A ressalva de sempre, e ela é a razão de a seção existir com esse desenho: a
 * tabela não ordena, não pontua e não conclui qual produto é preferível. A
 * ausência de uma coluna de veredito é o mecanismo, não um esquecimento.
 */
export default function ComparePage() {
  return (
    <>
      <Nav />

      <main id="conteudo">
        <div className="pt-20">
          <ComparisonSection />
        </div>

        <nav
          aria-label="Categorias"
          className="border-t border-edge-soft bg-deep px-6 py-16 sm:px-10"
        >
          <div className="mx-auto max-w-6xl">
            <p className="tech text-tertiary">Entrar por categoria</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categorias/${category.id}`}
                    className="block border border-edge px-5 py-3 text-base text-body transition-colors duration-300 hover:border-light hover:text-light"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <WhatsAppCTA
          title="Quer conversar sobre algum desses produtos?"
          subject="a diferença entre dois produtos que comparei no site"
        />
      </main>

      <Footer />
    </>
  );
}
