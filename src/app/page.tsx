import { DepthGauge } from "@/components/experience/DepthGauge";
import { BoundarySection } from "@/components/marketing/BoundarySection";
import { ComparisonSection } from "@/components/marketing/ComparisonSection";
import { ContactSection } from "@/components/marketing/ContactSection";
import { FamiliesSection } from "@/components/marketing/FamiliesSection";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { Nav } from "@/components/marketing/Nav";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";

/**
 * A página é uma descida.
 *
 * Superfície (as siglas como chegam) → coluna d'água (quem paga você) → zona
 * iluminada (o verbete e a comparação) → abismo (o limite do serviço) → e a
 * subida de volta à luz, que é a conversa com uma pessoa.
 *
 * A ordem não é estética. Cada seção é um nível a mais de detalhe, e a última
 * antes do contato é justamente aquela em que o site declara o que não faz —
 * porque é isso que explica por que o passo seguinte é humano.
 */
export default function HomePage() {
  return (
    <>
      <Nav />
      <DepthGauge />
      <main id="conteudo">
        <Hero />
        <FamiliesSection />
        <ProductShowcase />
        <ComparisonSection />
        <BoundarySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
