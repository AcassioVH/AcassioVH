import { z } from "zod";

import { isValidCnpj, normalizeCnpj } from "@/domain/cnpj/cnpj";
import { parseCurrencyToCents } from "@/domain/portfolio/money";
import { ASSET_CLASSES } from "@/domain/assets/taxonomy";

/**
 * Esquemas de validação de entrada.
 *
 * Um esquema declarado com regex simples em vez de `z.email()` porque validar
 * e-mail por gramática completa é ilusão de precisão: o único teste real é
 * enviar uma mensagem. Aqui basta rejeitar o que é claramente inválido.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "Informe um e-mail válido.")
  .max(254, "E-mail longo demais.")
  .regex(EMAIL_PATTERN, "Informe um e-mail válido.");

/**
 * Senha com mínimo de 12 caracteres e nenhuma regra de composição.
 *
 * Segue a orientação atual do NIST: comprimento protege mais que exigir
 * maiúscula, número e símbolo — regras de composição empurram o usuário para
 * padrões previsíveis do tipo "Senha@123", que são justamente os primeiros a
 * cair em ataque de dicionário.
 */
export const passwordSchema = z
  .string()
  .min(12, "A senha precisa ter ao menos 12 caracteres.")
  .max(200, "Senha longa demais.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120, "Nome longo demais."),
  email: emailSchema,
  password: passwordSchema,
  acceptedTerms: z
    .string()
    .optional()
    .refine((value) => value === "on", {
      message: "É necessário aceitar os termos e o aviso de tratamento de dados.",
    }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha."),
});

/** CNPJ opcional: vazio passa, preenchido precisa ter dígito verificador válido. */
const optionalCnpjSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || isValidCnpj(value), {
    message: "CNPJ inválido — confira os dígitos.",
  })
  .transform((value) => (value === null ? null : normalizeCnpj(value)));

const optionalTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "Texto longo demais.")
    .transform((value) => (value === "" ? null : value));

/** Data no formato do input[type=date]. Interpretada em UTC para não deslocar um dia. */
const optionalDateSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Data inválida.",
  })
  .transform((value) => (value === null ? null : new Date(`${value}T00:00:00.000Z`)))
  .refine((value) => value === null || !Number.isNaN(value.getTime()), {
    message: "Data inválida.",
  });

export const assetSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do ativo.").max(160, "Nome longo demais."),
  cnpj: optionalCnpjSchema,
  institution: optionalTextSchema(120),
  value: z
    .string()
    .trim()
    .min(1, "Informe o valor.")
    .transform((value) => parseCurrencyToCents(value))
    .refine((cents): cents is number => cents !== null, { message: "Valor inválido." })
    .refine((cents) => cents > 0, { message: "O valor precisa ser maior que zero." }),
  maturityDate: optionalDateSchema,
  assetClass: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine(
      (value) => value === null || (ASSET_CLASSES as readonly string[]).includes(value),
      { message: "Classe de ativo desconhecida." },
    ),
});

/** Primeira mensagem de erro por campo, no formato que os formulários consomem. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key] = issue.message;
    }
  }

  return result;
}
