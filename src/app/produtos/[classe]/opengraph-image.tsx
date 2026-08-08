import { notFound } from "next/navigation";

import { cartao, CARTAO } from "@/app/_og/cartao";
import { CATALOGUED_CLASSES, categoryOfClass, familyOf } from "@/domain/assets/families";
import { profileFor } from "@/domain/assets/profiles";
import type { AssetClass } from "@/domain/assets/taxonomy";

export const alt = "Verbete de produto de investimento";
export const size = CARTAO;
export const contentType = "image/png";

/** Uma imagem por verbete: é ela que aparece quando o link vai pelo WhatsApp. */
export function generateStaticParams() {
  return CATALOGUED_CLASSES.map((classe) => ({ classe }));
}

export default async function Image({ params }: { params: Promise<{ classe: string }> }) {
  const { classe } = await params;
  if (!(CATALOGUED_CLASSES as readonly string[]).includes(classe)) notFound();

  const assetClass = classe as AssetClass;
  const profile = profileFor(assetClass);
  const family = familyOf(assetClass);

  return cartao({
    // Para onde o dinheiro vai é o que distingue o produto — merece o olho.
    eyebrow: family ? `Destino: ${family.destino}` : "Produto de investimento",
    titulo: profile.fullName,
    descricao: profile.summary,
    accent: categoryOfClass(assetClass)?.accent ?? "#e3bc7e",
  });
}
