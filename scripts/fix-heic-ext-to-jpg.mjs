/**
 * Corrige URLs .heic migradas desde caché Vercel (contenido JPEG) → .jpg
 * Uso: node scripts/fix-heic-ext-to-jpg.mjs --product <id>
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

const PRODUCT_ID = process.argv[process.argv.indexOf("--product") + 1];
if (!PRODUCT_ID || PRODUCT_ID.startsWith("-")) {
  console.error("Uso: node scripts/fix-heic-ext-to-jpg.mjs --product <id>");
  process.exit(1);
}

const ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;
const KEY = process.env.BUNNY_STORAGE_ACCESS_KEY;
const HOST = process.env.BUNNY_STORAGE_HOST;
const CDN = process.env.NEXT_PUBLIC_BUNNY_CDN_URL.replace(/\/$/, "");
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.productImage.findMany({
    where: {
      productId: PRODUCT_ID,
      url: { contains: ".heic" },
    },
  });

  console.log(`HEIC a corregir: ${rows.length}`);

  for (const row of rows) {
    const oldKey = row.url.replace(`${CDN}/`, "");
    const newKey = oldKey.replace(/\.heic$/i, ".jpg");
    const newUrl = `${CDN}/${newKey}`;

    const dl = await fetch(row.url);
    if (!dl.ok) throw new Error(`download fail ${row.url}`);
    const buffer = Buffer.from(await dl.arrayBuffer());

    const put = await fetch(`https://${HOST}/${ZONE}/${newKey}`, {
      method: "PUT",
      headers: { AccessKey: KEY, "Content-Type": "image/jpeg" },
      body: new Uint8Array(buffer),
    });
    if (!put.ok) throw new Error(`put fail ${put.status}`);

    await prisma.productImage.update({
      where: { id: row.id },
      data: { url: newUrl },
    });

    await fetch(`https://${HOST}/${ZONE}/${oldKey}`, {
      method: "DELETE",
      headers: { AccessKey: KEY },
    });

    console.log(`OK  ${oldKey} → ${newKey}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
