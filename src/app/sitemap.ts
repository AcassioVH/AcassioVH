import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { CATALOGUED_CLASSES, CATEGORIES } from "@/domain/assets/destinations";
import { CATALOG_REVIEWED_AT } from "@/domain/assets/profiles";

/**
 * O mapa do site.
 *
 * O valor inteiro deste produto depende de alguém pesquisar "o que é um CRA" e
 * cair no verbete. Sem sitemap, os 36 verbetes existem e ninguém sabe disso —
 * são páginas estáticas alcançáveis só por navegação interna, e um buscador
 * pode levar meses para percorrer tudo por conta própria.
 *
 * `lastModified` sai de `CATALOG_REVIEWED_AT`, que é a data real da última
 * revisão editorial. Usar `new Date()` faria toda página parecer atualizada a
 * cada build — informação falsa, e que os buscadores aprendem a ignorar.
 *
 * `priority` aqui não é juízo sobre produto: é distância da home em cliques.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const revisado = new Date(CATALOG_REVIEWED_AT);

  return [
    {
      url: site.url,
      lastModified: revisado,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/comparar`,
      lastModified: revisado,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/instituicoes`,
      lastModified: revisado,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...CATEGORIES.map((category) => ({
      url: `${site.url}/categorias/${category.id}`,
      lastModified: revisado,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...CATALOGUED_CLASSES.map((assetClass) => ({
      url: `${site.url}/produtos/${assetClass}`,
      lastModified: revisado,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${site.url}/termos`,
      lastModified: new Date(site.legal.updatedAt),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/privacidade`,
      lastModified: new Date(site.legal.updatedAt),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
