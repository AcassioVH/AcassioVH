import { IBM_Plex_Mono, Libre_Caslon_Display, Source_Sans_3 } from "next/font/google";

/**
 * As três vozes tipográficas do sistema de marca.
 *
 * `next/font` baixa os arquivos no momento do build e os serve do próprio
 * domínio. Isso importa por três motivos: a página não depende do
 * fonts.googleapis.com em runtime, não há requisição a terceiro carregando
 * dado de navegação do usuário, e a CSP restritiva continua valendo.
 */

/** Títulos. A voz da marca. */
export const display = Libre_Caslon_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-face",
});

/** Corpo de texto. Tem itálico e três pesos porque o produto é de leitura longa. */
export const body = Source_Sans_3({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-face",
});

/**
 * Dado técnico: CNPJ, datas, rótulos de estado, valores.
 *
 * Monoespaçada por função, não por estética — dígito alinhado em coluna é o que
 * torna um CNPJ conferível contra o extrato.
 */
export const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-face",
});

export const fontVariables = `${display.variable} ${body.variable} ${mono.variable}`;
