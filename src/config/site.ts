/**
 * Configuração institucional.
 *
 * Dados de contato saem de variável de ambiente para que trocar telefone ou
 * e-mail não exija deploy de código — e para que o número real não fique
 * versionado no repositório público.
 */

const WHATSAPP_PLACEHOLDER = "5500000000000";

export const site = {
  name: "Acássium Invest",
  tagline: "A sua carteira, explicada.",
  description:
    "Organizamos e explicamos a composição da carteira que você já tem: classe, " +
    "emissor, liquidez, tributação e garantia. Conteúdo informativo, sem recomendação.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://acassium.com.br",

  advisor: {
    name: "Victor Acássio",
    role: "Assessor de investimentos",
    firm: "EQI Investimentos",
  },

  contact: {
    /** Formato internacional, apenas dígitos. Ex.: 5511999999999. */
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? WHATSAPP_PLACEHOLDER,
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contato@acassium.com.br",
  },
} as const;

/** True quando o número de contato ainda não foi configurado no ambiente. */
export const whatsappIsConfigured = site.contact.whatsappNumber !== WHATSAPP_PLACEHOLDER;

const DEFAULT_WHATSAPP_MESSAGE =
  "Olá, Victor. Vim pelo site da Acássium Invest e gostaria de conversar sobre a " +
  "organização da minha carteira.";

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
