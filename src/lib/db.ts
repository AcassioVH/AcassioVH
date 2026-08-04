import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma, instância única.
 *
 * Em desenvolvimento o Next recarrega módulos a cada alteração, e sem o cache
 * no `globalThis` cada recarga abriria um novo pool de conexões até o Postgres
 * recusar novas. Em produção o módulo é avaliado uma vez e a guarda não custa
 * nada.
 *
 * A partir do Prisma 7 a conexão é feita por driver adapter, não pela URL no
 * schema — daí o `PrismaPg`.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não definida. Copie .env.example para .env.local e preencha.",
  );
}

function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    // Em produção, `query` vazaria dado de carteira para o log. Fica de fora.
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
