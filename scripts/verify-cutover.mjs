/**
 * Verifica que DATABASE_URL/DIRECT_URL apuntan a Casa Verde y responden.
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

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const url = process.env.DATABASE_URL;
const direct = process.env.DIRECT_URL;
if (!url || !direct) {
  console.error("Faltan DATABASE_URL o DIRECT_URL");
  process.exit(1);
}

const host = new URL(url).host;
const directHost = new URL(direct).host;
console.log("DATABASE_URL host:", host);
console.log("DIRECT_URL host:", directHost);

if (!host.includes("ep-round-fire") || !directHost.includes("ep-round-fire")) {
  console.error("FAIL: no apunta a Casa Verde (ep-round-fire)");
  process.exit(1);
}
if (host.includes("ep-bold-boat") || directHost.includes("ep-bold-boat")) {
  console.error("FAIL: todavía apunta a la BD vieja (ep-bold-boat)");
  process.exit(1);
}

const prisma = new PrismaClient();

const checks = [
  ["users", () => prisma.user.count()],
  ["products", () => prisma.product.count()],
  ["product_colors", () => prisma.productColor.count()],
  ["product_images", () => prisma.productImage.count()],
  ["product_variants", () => prisma.productVariant.count()],
  ["product_item_colors", () => prisma.productItemColor.count()],
  ["orders", () => prisma.order.count()],
  ["order_items", () => prisma.orderItem.count()],
  ["webhook_logs", () => prisma.webhookLog.count()],
  ["promo_popups", () => prisma.promoPopup.count()],
  ["hero_slides", () => prisma.heroSlide.count()],
];

try {
  for (const [name, fn] of checks) {
    console.log(`${name}: ${await fn()}`);
  }
  console.log("\nOK — cutover connection verified (Casa Verde).");
} catch (err) {
  console.error("\nFALLÓ verify-cutover:");
  console.error(err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
