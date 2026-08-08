import { notFound } from "next/navigation";

import { cartao, CARTAO } from "@/app/_og/cartao";
import { CATEGORIES, categoryById, classesOf } from "@/domain/assets/destinations";

export const alt = "Categoria de produtos de investimento";
export const size = CARTAO;
export const contentType = "image/png";

/** Uma imagem por categoria, gerada no build junto com a página. */
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ id: category.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = categoryById(id);
  if (!category) notFound();

  return cartao({
    eyebrow: `${classesOf(category).length} produtos`,
    titulo: category.label,
    descricao: category.summary,
    accent: category.accent,
  });
}
