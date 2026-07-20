/**
 * Limpia order_items con imageUrl Cloudinary irrecuperable (404).
 * SOLO UPDATE imageUrl → null. Nunca borra pedidos ni líneas.
 *
 * Uso: node scripts/null-orphan-order-item-images.mjs --apply
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

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const DRY_RUN = !process.argv.includes("--apply");
const prisma = new PrismaClient();

const ORPHAN_IDS = [
  "cmoaw8acp0004dtctxi4rlv6i", // Top Sole
  "cmoxgbi6z000434tfvxvnvnpf", // Set Cherry — Pantalon
  "cmoxgbi6z000534tfzcd9asxz", // Set Asimétrico — Short
  "cmp79s9y0000411k2kp7uzta8", // Top Victoria
];

async function main() {
  console.log(DRY_RUN ? "=== DRY RUN ===" : "=== APPLY (imageUrl → null) ===");

  const rows = await prisma.orderItem.findMany({
    where: { id: { in: ORPHAN_IDS } },
    select: { id: true, name: true, imageUrl: true },
  });

  for (const row of rows) {
    console.log(`[${row.name}] ${row.imageUrl?.slice(0, 80)}...`);
    if (DRY_RUN) continue;

    await prisma.orderItem.update({
      where: { id: row.id },
      data: { imageUrl: null },
    });
    console.log(`  → null`);
  }

  const left = await prisma.orderItem.count({
    where: { imageUrl: { contains: "res.cloudinary.com" } },
  });
  console.log(`\nRestantes Cloudinary en order_items: ${left}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
