import "dotenv/config";

import { defineConfig, env } from "prisma/config";

/**
 * Configuração do Prisma CLI (migrate, studio, introspect).
 *
 * A partir do Prisma 7 a URL de conexão sai do `schema.prisma` e vem para cá —
 * o schema passa a declarar apenas o provider. Em runtime, o `PrismaClient`
 * recebe um driver adapter (ver `src/lib/db.ts`); este arquivo serve às
 * ferramentas de linha de comando.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
