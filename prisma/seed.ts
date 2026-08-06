/**
 * Carteira de demonstração, para conhecer o sistema com dados dentro.
 *
 * Cria uma conta e sete ativos reais do mercado brasileiro, escolhidos para
 * exercitar o que o produto faz de mais interessante:
 *
 *  - CDB e LCI no mesmo banco somam acima do teto do FGC, então a leitura de
 *    cobertura tem algo para mostrar;
 *  - HGLG11 e PETR4 caem em "a confirmar", porque ticker não identifica o tipo
 *    com certeza — é o comportamento honesto do classificador;
 *  - há vencimentos em anos diferentes, para o calendário fazer sentido.
 *
 * Os campos sensíveis passam pela mesma cifra do produto: o seed não é um
 * atalho por fora das regras.
 */

import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { encryptField, encryptOptional } from "../src/lib/security/crypto";
import { classifyAsset } from "../src/domain/assets/classify";

const DEMO_EMAIL = "demo@acassium.com.br";
const DEMO_PASSWORD = "carteira-de-demonstracao";

const ASSETS = [
  { name: "CDB Banco Master 2027", cents: 180_000_00, institution: "Banco Master", maturity: "2027-06-15" },
  { name: "LCI Banco Master 2026", cents: 100_000_00, institution: "Banco Master", maturity: "2026-12-10" },
  { name: "Tesouro IPCA+ 2035", cents: 120_000_00, institution: "XP Investimentos", maturity: "2035-05-15" },
  { name: "Debênture Energisa 2029", cents: 55_000_00, institution: "Itaú", maturity: "2029-08-01" },
  { name: "VGBL Brasilprev", cents: 75_000_00, institution: "Brasilprev", maturity: null },
  { name: "PETR4", cents: 40_000_00, institution: "XP Investimentos", maturity: null },
  { name: "HGLG11", cents: 65_000_00, institution: "XP Investimentos", maturity: null },
] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL não definida.");

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  // Recriar do zero mantém o seed idempotente: rodar duas vezes não duplica.
  await db.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await db.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Cliente Demonstração",
      passwordHash: await hash(DEMO_PASSWORD, {
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      }),
      termsAcceptedAt: new Date(),
    },
    select: { id: true },
  });

  for (const asset of ASSETS) {
    const classification = classifyAsset({ declaredName: asset.name });

    await db.asset.create({
      data: {
        userId: user.id,
        name: encryptField(asset.name),
        cnpj: null,
        institution: encryptOptional(asset.institution),
        declaredValueCents: encryptField(String(asset.cents)),
        maturityDate: asset.maturity ? new Date(`${asset.maturity}T00:00:00.000Z`) : null,
        assetClass: classification.assetClass,
        confidence: classification.confidence,
        classConfirmedByUser: false,
      },
    });
  }

  console.info(
    [
      "",
      "Carteira de demonstração criada.",
      "",
      `  E-mail:  ${DEMO_EMAIL}`,
      `  Senha:   ${DEMO_PASSWORD}`,
      "",
      `  ${ASSETS.length} ativos · R$ ${(
        ASSETS.reduce((sum, a) => sum + a.cents, 0) / 100
      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      "",
      "Estes são dados fictícios, para conhecer o sistema. Não representam a",
      "carteira de ninguém.",
      "",
    ].join("\n"),
  );

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
