import { AssetsSection } from "@/components/marketing/AssetsSection";
import { BoundarySection } from "@/components/marketing/BoundarySection";
import { CompositionSection } from "@/components/marketing/CompositionSection";
import { ContactSection } from "@/components/marketing/ContactSection";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { Nav } from "@/components/marketing/Nav";
import { SecuritySection } from "@/components/marketing/SecuritySection";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main id="conteudo">
        <Hero />
        <CompositionSection />
        <AssetsSection />
        <SecuritySection />
        <BoundarySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
