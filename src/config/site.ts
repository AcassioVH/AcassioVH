/**
 * Configuração institucional.
 *
 * Dados de contato saem de variável de ambiente para que trocar telefone ou
 * e-mail não exija deploy de código — e para que o número real não fique
 * versionado no repositório público.
 */

/**
 * WhatsApp de contato do assessor, em formato internacional.
 *
 * Fica como padrão no código, e não só em variável de ambiente, porque este
 * número é contato comercial destinado a aparecer publicamente no site — o
 * botão precisa funcionar num deploy limpo. A variável de ambiente continua
 * tendo precedência, para trocar o número sem publicar código novo.
 */
// (82) 98895-0850, em formato internacional: 55 + DDD + número.
const WHATSAPP_DEFAULT = "5582988950850";

export const site = {
  name: "Acássium Invest",
  tagline: "Os produtos de investimento, explicados.",
  /**
   * O que aparece no resultado de busca e no cartão do WhatsApp.
   *
   * Ficou desatualizada por uma versão inteira: descrevia a plataforma que
   * recebia a carteira do usuário, produto que deixou de existir. Descrição
   * errada é pior do que descrição ausente — promete na busca um serviço que a
   * pessoa não encontra ao chegar.
   */
  description:
    "Dicionário dos produtos de investimento do mercado brasileiro: o que cada um é, " +
    "quem paga o investidor, como funciona o resgate, qual a tributação e qual a " +
    "garantia. Conteúdo informativo, sem recomendação.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://acassium.com.br",

  advisor: {
    name: "Victor Acássio",
    role: "Assessor de investimentos",
    firm: "EQI Investimentos",
  },

  contact: {
    /** Formato internacional, apenas dígitos. Ex.: 5511999999999. */
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_DEFAULT,
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contato@acassium.com.br",
  },

  /**
   * Identificação do controlador, exigida pela LGPD (art. 9º, I).
   *
   * Deixado explicitamente vazio: razão social, CNPJ e endereço só o titular do
   * negócio pode informar. As páginas legais renderizam um marcador visível no
   * lugar, para que a pendência apareça na tela em vez de passar despercebida.
   */
  legal: {
    entityName: process.env.NEXT_PUBLIC_LEGAL_ENTITY ?? null,
    entityDocument: process.env.NEXT_PUBLIC_LEGAL_DOCUMENT ?? null,
    /** Data da última revisão dos documentos legais. */
    updatedAt: "2026-08-05",
  },
} as const;

/**
 * Confere se o número tem forma de telefone internacional discável.
 *
 * Se alguém definir a variável de ambiente com lixo, a interface cai para
 * e-mail em vez de gerar um link wa.me que abre uma conversa vazia — falha
 * silenciosa que ninguém percebe até um cliente desistir de entrar em contato.
 */
export const whatsappIsConfigured = /^\d{12,15}$/.test(site.contact.whatsappNumber);

const DEFAULT_WHATSAPP_MESSAGE =
  "Olá, Victor. Vim pelo site da Acássium Invest e gostaria de conversar sobre a " +
  "organização da minha carteira.";

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
