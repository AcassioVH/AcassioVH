#!/usr/bin/env node

/**
 * Prepara o ambiente de teste local em um comando.
 *
 * O que ele faz, nesta ordem:
 *   1. cria `.env.local` com segredos aleatórios de verdade, se ainda não existir;
 *   2. confere se o banco responde, e explica o que fazer se não responder;
 *   3. aplica as migrações;
 *   4. cria a carteira de demonstração.
 *
 * As chaves são geradas com `crypto.randomBytes` — nunca valores de exemplo.
 * Um segredo de exemplo que "funciona" é o tipo de coisa que sobrevive até a
 * produção sem ninguém notar.
 */

import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_PATH = resolve(ROOT, ".env.local");

const DEFAULT_DATABASE_URL =
  "postgresql://acassium:acassium@localhost:5433/acassium?sslmode=disable";

function line(text = "") {
  console.log(text);
}

function secret() {
  return randomBytes(32).toString("base64");
}

function createEnvFile() {
  if (existsSync(ENV_PATH)) {
    line("· .env.local já existe — mantido como está.");
    return readFileSync(ENV_PATH, "utf8");
  }

  const contents = [
    "# Gerado por `npm run preparar`. Ambiente de teste local.",
    "# As chaves abaixo são aleatórias e valem só para esta máquina.",
    "",
    `DATABASE_URL="${process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL}"`,
    `AUTH_SECRET="${secret()}"`,
    `FIELD_ENCRYPTION_KEY="${secret()}"`,
    "",
    'NEXT_PUBLIC_SITE_URL="http://localhost:3000"',
    "",
    "# Sem RESEND_API_KEY, o e-mail de recuperação de senha é escrito no",
    "# terminal onde o `npm run dev` está rodando, com o link inteiro.",
    'RESEND_API_KEY=""',
    "",
  ].join("\n");

  writeFileSync(ENV_PATH, contents);
  line("· .env.local criado com chaves novas.");
  return contents;
}

function databaseUrlFrom(envContents) {
  const match = envContents.match(/^DATABASE_URL="(.+)"$/m);
  return match?.[1] ?? DEFAULT_DATABASE_URL;
}

function run(command, env) {
  execSync(command, { cwd: ROOT, stdio: "inherit", env: { ...process.env, ...env } });
}

function main() {
  line();
  line("Preparando o ambiente de teste da Acássium Invest");
  line("─".repeat(56));

  const envContents = createEnvFile();
  const databaseUrl = databaseUrlFrom(envContents);
  const env = { DATABASE_URL: databaseUrl };

  line("· aplicando as migrações do banco…");
  try {
    run("npx prisma migrate deploy", env);
  } catch {
    line();
    line("Não consegui falar com o banco de dados.");
    line();
    line(`  URL tentada: ${databaseUrl}`);
    line();
    line("  Se você usa Docker, suba o banco com:");
    line("      docker compose up -d");
    line();
    line("  Se já tem um PostgreSQL próprio, ajuste DATABASE_URL em .env.local");
    line("  e rode `npm run preparar` de novo.");
    line();
    process.exit(1);
  }

  line("· gerando o cliente do banco…");
  run("npx prisma generate", env);

  line("· criando a carteira de demonstração…");
  run("npx tsx --env-file=.env.local prisma/seed.ts", env);

  line("─".repeat(56));
  line("Pronto. Agora rode:");
  line();
  line("    npm run dev");
  line();
  line("e abra http://localhost:3000");
  line();
}

main();
