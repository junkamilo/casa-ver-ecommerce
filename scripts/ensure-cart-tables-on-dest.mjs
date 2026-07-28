/**
 * Crea tablas carts + cart_items SOLO en destino Casa Verde (additive).
 * No toca la BD origen.
 *
 * Uso: node scripts/ensure-cart-tables-on-dest.mjs
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
    process.env[match[1]] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));

const targetUrl =
  process.env.DIRECT_URL_CASA_VERDE || process.env.DATABASE_URL_CASA_VERDE;
if (!targetUrl) {
  console.error("Falta DIRECT_URL_CASA_VERDE");
  process.exit(1);
}

const target = new PrismaClient({
  datasources: { db: { url: targetUrl } },
});

const statements = [
  `CREATE TABLE IF NOT EXISTS "carts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "abandonedEmailSentAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "carts_userId_key" ON "carts"("userId")`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'carts_userId_fkey') THEN
      ALTER TABLE "carts"
        ADD CONSTRAINT "carts_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
  `CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "color" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_cartId_variantId_key" ON "cart_items"("cartId", "variantId")`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_cartId_fkey') THEN
      ALTER TABLE "cart_items"
        ADD CONSTRAINT "cart_items_cartId_fkey"
        FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$`,
];

console.log("Creando carts/cart_items en:", new URL(targetUrl).host);
for (const [i, sql] of statements.entries()) {
  await target.$executeRawUnsafe(sql);
  console.log(`  OK statement ${i + 1}/${statements.length}`);
}

const tables = await target.$queryRawUnsafe(`
  SELECT tablename FROM pg_tables
  WHERE schemaname='public' AND tablename IN ('carts','cart_items')
  ORDER BY tablename
`);
console.log("Tablas:", tables);
await target.$disconnect();
