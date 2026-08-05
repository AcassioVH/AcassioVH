import { beforeAll, describe, expect, it } from "vitest";

// A chave precisa existir antes do módulo derivar as subchaves.
beforeAll(() => {
  process.env.FIELD_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
});

const {
  decryptField,
  decryptOptional,
  encryptField,
  encryptOptional,
  hmacKey,
  safeEquals,
} = await import("../src/lib/security/crypto");

describe("cifra de campo", () => {
  it("decifra de volta ao valor original", () => {
    const original = "CDB Banco Exemplo 2027";
    expect(decryptField(encryptField(original))).toBe(original);
  });

  it("preserva acentuação e unicode", () => {
    const original = "Previdência — instituição Ação & Cia ✓";
    expect(decryptField(encryptField(original))).toBe(original);
  });

  it("preserva string vazia", () => {
    expect(decryptField(encryptField(""))).toBe("");
  });

  it("preserva números longos, que é como o valor declarado trafega", () => {
    const original = "9007199254740993";
    expect(decryptField(encryptField(original))).toBe(original);
  });

  it("não deixa o texto original aparecer no criptograma", () => {
    const encrypted = encryptField("Banco Exemplo");
    expect(encrypted).not.toContain("Banco");
    expect(encrypted).not.toContain("Exemplo");
  });

  it("produz saídas diferentes para o mesmo valor", () => {
    // IV aleatório por chamada. Sem isso, comparar criptogramas revelaria quais
    // usuários têm a mesma instituição — sem decifrar nada.
    const a = encryptField("Banco Exemplo");
    const b = encryptField("Banco Exemplo");

    expect(a).not.toBe(b);
    expect(decryptField(a)).toBe(decryptField(b));
  });

  it("marca a versão do formato, para permitir rotação depois", () => {
    expect(encryptField("x").startsWith("v1:")).toBe(true);
  });
});

describe("integridade", () => {
  it("rejeita criptograma adulterado", () => {
    // GCM é cifra autenticada: alterar um byte precisa falhar, não devolver
    // lixo silenciosamente. É o que impede mexer no valor declarado por
    // escrita direta no banco.
    const encrypted = encryptField("10000");
    const payload = Buffer.from(encrypted.slice(3), "base64");
    const lastIndex = payload.length - 1;
    payload.writeUInt8(payload.readUInt8(lastIndex) ^ 0xff, lastIndex);
    const tampered = `v1:${payload.toString("base64")}`;

    expect(() => decryptField(tampered)).toThrow();
  });

  it("rejeita texto em claro em vez de aceitá-lo como legado", () => {
    // Aceitar silenciosamente transformaria qualquer escrita não cifrada em
    // um bypass invisível.
    expect(() => decryptField("Banco Exemplo")).toThrow(/desconhecido/i);
  });

  it("rejeita versão desconhecida", () => {
    expect(() => decryptField("v9:AAAA")).toThrow(/desconhecido/i);
  });

  it("rejeita conteúdo truncado", () => {
    expect(() => decryptField("v1:AAAA")).toThrow(/truncado/i);
  });
});

describe("campos opcionais", () => {
  it("deixa null atravessar intacto", () => {
    expect(encryptOptional(null)).toBeNull();
    expect(decryptOptional(null)).toBeNull();
  });

  it("cifra quando há valor", () => {
    const encrypted = encryptOptional("00000000000191");
    expect(encrypted).not.toBeNull();
    expect(decryptOptional(encrypted)).toBe("00000000000191");
  });
});

describe("HMAC determinístico", () => {
  it("devolve sempre o mesmo resultado para a mesma entrada", () => {
    // É o que permite achar a linha do contador por igualdade exata.
    expect(hmacKey("login:conta:a@b.com")).toBe(hmacKey("login:conta:a@b.com"));
  });

  it("separa entradas diferentes", () => {
    expect(hmacKey("login:conta:a@b.com")).not.toBe(hmacKey("login:conta:c@d.com"));
  });

  it("não deixa o e-mail legível na saída", () => {
    expect(hmacKey("login:conta:vitima@exemplo.com")).not.toContain("vitima");
  });
});

describe("comparação em tempo constante", () => {
  it("compara corretamente", () => {
    expect(safeEquals("abc", "abc")).toBe(true);
    expect(safeEquals("abc", "abd")).toBe(false);
  });

  it("não estoura com tamanhos diferentes", () => {
    expect(safeEquals("abc", "abcdef")).toBe(false);
  });
});
