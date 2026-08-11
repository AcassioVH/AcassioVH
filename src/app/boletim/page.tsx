import type { Metadata } from "next";

import { Boletim } from "@/components/boletim/Boletim";
import { Footer } from "@/components/marketing/Footer";
import { Nav } from "@/components/marketing/Nav";

/**
 * O boletim de conjuntura.
 *
 * **Fora do índice, e de propósito.** O resto do site existe para ser
 * encontrado: sitemap, dados estruturados, cartão de compartilhamento por
 * verbete. Esta página é o contrário. O conteúdo dela nasce a cada apuração e
 * some quando a aba fecha, então o que um buscador indexaria é uma casca vazia
 * — e o que ele mostraria ao visitante seria uma promessa que a página não
 * cumpre sozinha. Ela também não entra na barra de navegação: é ferramenta de
 * trabalho do assessor, não degrau da leitura de quem chega para entender o
 * que é um CDB.
 *
 * **É a única página do site que precisa de servidor.** Todas as outras saem
 * do build como HTML e rodam em qualquer hospedagem de arquivos. Esta conversa
 * com `/api/boletim`, que guarda a chave da API — ver o cabeçalho da rota para
 * o que essa exceção custa, e `docs/ARCHITECTURE.md` para por que ela foi
 * aceita. Sem a chave no ambiente, a página abre e diz que a apuração está
 * desligada; nada mais no site muda.
 */
export const metadata: Metadata = {
  title: "Boletim de conjuntura",
  description:
    "Leitura diária de conjuntura econômica brasileira, apurada em fontes públicas com " +
    "veículo e data em cada afirmação. Uso interno.",
  robots: { index: false, follow: false },
};

export default function BoletimPage() {
  return (
    <>
      <Nav />

      <main id="conteudo">
        <Boletim />
      </main>

      <Footer />
    </>
  );
}
