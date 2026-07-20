/** Fix order_items whose Cloudinary snapshot 404 — use current product cover from Bunny */
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

const prisma = new PrismaClient();

function isBunny(url) {
  try {
    const h = new URL(url).hostname;
    return h === "media.casaverdeoficial.com" || h === "casa-verde-cdn.b-cdn.net";
  } catch {
    return false;
  }
}

async function findProductCoverUrl(productId) {
  const cover = await prisma.productImage.findFirst({
    where: { productId, isCover: true, url: { contains: "media.casaverdeoficial.com" } },
    select: { url: true },
  });
  if (cover?.url) return cover.url;

  const any = await prisma.productImage.findFirst({
    where: { productId, url: { contains: "media.casaverdeoficial.com" } },
    orderBy: { order: "asc" },
    select: { url: true },
  });
  return any?.url ?? null;
}

async function main() {
  const pending = await prisma.orderItem.findMany({
    where: { imageUrl: { contains: "res.cloudinary.com" } },
    select: { id: true, productId: true, name: true, sku: true, imageUrl: true },
  });

  console.log(`Pendientes Cloudinary: ${pending.length}`);

  for (const item of pending) {
    const fallback = await findProductCoverUrl(item.productId);
    if (!fallback || !isBunny(fallback)) {
      console.log(`[SKIP] ${item.id} ${item.name} — sin imagen Bunny en producto`);
      continue;
    }

    await prisma.orderItem.update({
      where: { id: item.id },
      data: { imageUrl: fallback },
    });
    console.log(`[OK] ${item.name} → ${fallback}`);
  }

  const left = await prisma.orderItem.count({
    where: { imageUrl: { contains: "res.cloudinary.com" } },
  });
  console.log(`Restantes Cloudinary: ${left}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
