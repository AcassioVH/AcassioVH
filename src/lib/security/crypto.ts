import {
  createDecipheriv,
  createCipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/**
 * Criptografia de campo, em repouso.
 *
 * Protege contra um cenário específico e realista: alguém obtém um dump do
 * banco — backup vazado, réplica mal configurada, acesso de leitura amplo
 * demais. TLS não ajuda aí, e o controle de acesso do Postgres já foi
 * contornado por definição. Sem isso, quem lê a tabela lê a carteira inteira.
 *
 * Não protege contra comprometimento do servidor da aplicação: lá a chave
 * está em memória, por necessidade. Nenhum esquema de criptografia de campo
 * protege contra isso, e prometer o contrário seria falso conforto.
 *
 * AES-256-GCM porque é cifra autenticada: além de esconder, detecta
 * adulteração. Com AES-CBC puro, alguém com acesso de escrita poderia alterar
 * bytes do valor declarado sem que percebêssemos.
 */

const VERSION = "v1";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

/**
 * Chaves derivadas da mestra por HKDF, uma por finalidade.
 *
 * Usar a mesma chave para cifrar e para gerar HMAC é erro clássico: as duas
 * operações passam a compartilhar destino se uma delas for comprometida ou
 * mal usada. A separação custa nada e é o que a boa prática manda.
 */
type DerivedKeys = { readonly encryption: Buffer; readonly hmac: Buffer };

let cachedKeys: DerivedKeys | null = null;

function deriveKeys(): DerivedKeys {
  if (cachedKeys) return cachedKeys;

  const raw = process.env.FIELD_ENCRYPTION_KEY;

  if (!raw) {
    throw new Error(
      "FIELD_ENCRYPTION_KEY não definida. Gere com: openssl rand -base64 32",
    );
  }

  const master = Buffer.from(raw, "base64");

  if (master.length < KEY_BYTES) {
    throw new Error(
      `FIELD_ENCRYPTION_KEY precisa ter ao menos ${KEY_BYTES} bytes em base64. ` +
        "Gere com: openssl rand -base64 32",
    );
  }

  cachedKeys = {
    encryption: Buffer.from(hkdfSync("sha256", master, "", "acassium:field:v1", KEY_BYTES)),
    hmac: Buffer.from(hkdfSync("sha256", master, "", "acassium:hmac:v1", KEY_BYTES)),
  };

  return cachedKeys;
}

/**
 * Cifra um valor.
 *
 * IV aleatório por valor, portanto o mesmo texto gera saídas diferentes a cada
 * chamada. Isso é proposital: com IV fixo, valores iguais produziriam
 * criptogramas iguais e a tabela entregaria, por comparação, quais usuários têm
 * a mesma instituição ou o mesmo valor declarado — sem decifrar nada.
 */
export function encryptField(plain: string): string {
  const { encryption } = deriveKeys();
  const iv = randomBytes(IV_BYTES);

  const cipher = createCipheriv("aes-256-gcm", encryption, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${VERSION}:${Buffer.concat([iv, tag, ciphertext]).toString("base64")}`;
}

/**
 * Decifra um valor.
 *
 * Lança se o formato for desconhecido ou se a autenticação falhar. É
 * deliberadamente estrito: aceitar texto em claro silenciosamente como
 * "legado" transformaria qualquer escrita não cifrada em um bypass invisível.
 */
export function decryptField(stored: string): string {
  const separator = stored.indexOf(":");
  const version = separator === -1 ? "" : stored.slice(0, separator);

  if (version !== VERSION) {
    throw new Error(`Formato de campo cifrado desconhecido: "${version}".`);
  }

  const { encryption } = deriveKeys();
  const payload = Buffer.from(stored.slice(separator + 1), "base64");

  if (payload.length < IV_BYTES + TAG_BYTES) {
    throw new Error("Campo cifrado truncado.");
  }

  const iv = payload.subarray(0, IV_BYTES);
  const tag = payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = payload.subarray(IV_BYTES + TAG_BYTES);

  const decipher = createDecipheriv("aes-256-gcm", encryption, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/** Cifra opcional: `null` atravessa intacto. */
export function encryptOptional(plain: string | null): string | null {
  return plain === null ? null : encryptField(plain);
}

export function decryptOptional(stored: string | null): string | null {
  return stored === null ? null : decryptField(stored);
}

/**
 * HMAC determinístico, para valores que precisam ser consultáveis.
 *
 * Usado nas chaves de limite de tentativas, que embutem e-mail. Cifrar não
 * serviria ali: a busca é por igualdade exata, e o IV aleatório — justamente o
 * que torna a cifra segura — impediria encontrar a linha. O HMAC dá o
 * contrário: mesma entrada, mesma saída, e nada de e-mail legível no banco.
 *
 * A contrapartida é assumida: igualdade fica visível. Para uma tabela de
 * contadores efêmeros é troca aceitável; para dado de carteira não seria, e por
 * isso lá usamos cifra.
 */
export function hmacKey(value: string): string {
  const { hmac } = deriveKeys();
  return createHmac("sha256", hmac).update(value, "utf8").digest("base64url");
}

/** Comparação em tempo constante, para quando houver segredo dos dois lados. */
export function safeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
