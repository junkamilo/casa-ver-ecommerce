import { PrismaClient } from "@prisma/client";

const SLOW_QUERY_MS = 200;
const isTestEnv =
  process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      ...(isTestEnv
        ? []
        : [{ emit: "event" as const, level: "query" as const }]),
      ...(process.env.NODE_ENV === "development"
        ? ([
            { emit: "stdout" as const, level: "warn" as const },
            { emit: "stdout" as const, level: "error" as const },
          ] as const)
        : ([{ emit: "stdout" as const, level: "error" as const }] as const)),
    ],
  });

  if (!isTestEnv) {
    // Tipado: emit "event" habilita $on("query"); cast necesario en Prisma 5.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).$on("query", (e: { duration: number; query: string }) => {
      if (e.duration <= SLOW_QUERY_MS) return;
      console.warn("[prisma:slow]", {
        ms: e.duration,
        q: e.query.slice(0, 120),
      });
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reutilizar la misma instancia entre invocaciones serverless (Vercel warm starts).
globalForPrisma.prisma = prisma;
