import { cartao, CARTAO } from "./_og/cartao";
import { site } from "@/config/site";
import { CATALOGUED_CLASSES } from "@/domain/assets/destinations";

export const alt = `${site.name} — ${site.tagline}`;
export const size = CARTAO;
export const contentType = "image/png";

export default async function Image() {
  return cartao({
    eyebrow: "Conteúdo educativo",
    titulo: "Visto de cima, tudo parece igual.",
    descricao: `${CATALOGUED_CLASSES.length} produtos de investimento explicados pela estrutura: o que são, para onde vai o seu dinheiro e sob quais regras.`,
  });
}
