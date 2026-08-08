import type { MetadataRoute } from "next";

import { site } from "@/config/site";

/**
 * Regras para robôs.
 *
 * Tudo é público e tudo pode ser indexado: não há área logada, não há conteúdo
 * pago e não há dado de usuário em lugar nenhum do site. Um `Disallow` aqui
 * seria contra o propósito — o produto existe para ser encontrado.
 *
 * A única função prática deste arquivo é apontar o sitemap, que é como o robô
 * descobre os 36 verbetes sem depender de percorrer a navegação inteira.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
