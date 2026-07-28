/**
 * Inspección read-only de origen vs destino Casa Verde.
 * Uso: node scripts/inspect-neon-targets.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));

const source = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});
const target = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL_CASA_VERDE || process.env.DATABASE_URL_CASA_VERDE },
  },
});

async function tableInfo(prisma, label) {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  const migrations = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at, rolled_back_at
    FROM "_prisma_migrations"
    ORDER BY finished_at NULLS LAST, migration_name
  `).catch(() => []);

  let users = null;
  let accounts = null;
  try { users = await prisma.user.count(); } catch (e) { users = `ERR: ${e.code || e.message}`; }
  try { accounts = await prisma.account.count(); } catch (e) { accounts = `ERR: ${e.code || e.message}`; }

  console.log(`\n=== ${label} ===`);
  console.log("tables:", tables.map((t) => t.tablename).join(", "));
  console.log("users count:", users);
  console.log("accounts count:", accounts);
  console.log("migrations applied:", Array.isArray(migrations) ? migrations.length : migrations);
  if (Array.isArray(migrations) && migrations.length) {
    const last = migrations[migrations.length - 1];
    console.log("last migration:", last.migration_name, last.rolled_back_at ? "(rolled back)" : "");
    const failed = migrations.filter((m) => !m.finished_at || m.rolled_back_at);
    if (failed.length) console.log("incomplete:", failed.map((m) => m.migration_name));
  }
}

await tableInfo(source, "ORIGEN (actual)");
await tableInfo(target, "DESTINO (Casa Verde)");
await source.$disconnect();
await target.$disconnect();
