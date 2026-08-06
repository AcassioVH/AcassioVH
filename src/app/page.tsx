import { AssetsSection } from "@/components/marketing/AssetsSection";
import { BoundarySection } from "@/components/marketing/BoundarySection";
import { CompositionSection } from "@/components/marketing/CompositionSection";
import { ContactSection } from "@/components/marketing/ContactSection";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { Nav } from "@/components/marketing/Nav";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { TranslationSection } from "@/components/marketing/TranslationSection";

/**
 * A página desce a escala de profundidade do sistema de marca.
 *
 * Superfície (o nome que chega) → coluna d'água (a tradução) → zona iluminada
 * (o verbete) → estrutura → fundo (o limite do serviço). Não é ordem estética:
 * cada passo é um nível a mais de detalhe, e o último é onde a nossa luz para.
 */
export default function LandingPage() {
  return (
    <>
      <Nav />
      <main id="conteudo">
        <Hero />
        <TranslationSection />
        <AssetsSection />
        <CompositionSection />
        <SecuritySection />
        <BoundarySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
