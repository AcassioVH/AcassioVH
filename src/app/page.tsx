import { DepthGauge } from "@/components/experience/DepthGauge";
import { BoundarySection } from "@/components/marketing/BoundarySection";
import { CategoriesSection } from "@/components/marketing/CategoriesSection";
import { ContactSection } from "@/components/marketing/ContactSection";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { IntroSection } from "@/components/marketing/IntroSection";
import { Nav } from "@/components/marketing/Nav";
import { GlossarioJsonLd } from "@/components/seo/StructuredData";
import { CATALOGUED_CLASSES } from "@/domain/assets/families";

/**
 * A home tem uma função só: apresentar o site e entregar o leitor à categoria
 * certa.
 *
 * A versão anterior tentava fazer tudo aqui — as famílias, o verbete de cada
 * produto num painel de abas e a comparação lado a lado, tudo na mesma rolagem.
 * Ficou completo e ilegível: informação demais junta, sem hierarquia, e o
 * visitante precisava atravessar o site inteiro para descobrir por onde começar.
 *
 * Agora a home é curta e a profundidade mora em outro lugar: cada categoria tem
 * página própria (`/categorias/[id]`), cada produto tem verbete próprio
 * (`/produtos/[classe]`), e a comparação virou uma ferramenta com endereço
 * (`/comparar`). Uma decisão por tela.
 *
 * O que sobra aqui: quem somos, por onde entrar, onde a nossa competência
 * termina, e como falar com uma pessoa.
 */
export default function HomePage() {
  return (
    <>
      <Nav />
      <DepthGauge />
      <main id="conteudo">
        <Hero />
        <IntroSection />
        <CategoriesSection />
        <BoundarySection />
        <ContactSection />
      </main>
      <Footer />
      <GlossarioJsonLd termos={CATALOGUED_CLASSES.length} />
    </>
  );
}
