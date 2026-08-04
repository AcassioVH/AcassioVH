import { hash, verify } from "@node-rs/argon2";

/**
 * Hashing de senha com argon2id.
 *
 * Parâmetros seguem a recomendação do OWASP para argon2id (19 MiB de memória,
 * 2 iterações, paralelismo 1). O custo é deliberado: uma verificação que leva
 * ~50ms é imperceptível no login e torna força bruta offline cara.
 */
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

/**
 * Confere a senha contra o hash.
 *
 * Nunca lança: hash corrompido ou em formato antigo devolve `false`, para que
 * a rota de login trate qualquer falha como credencial inválida em vez de
 * devolver erro 500 — que, por si só, já contaria ao atacante que aquele
 * e-mail existe.
 */
export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashed, plain, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}
