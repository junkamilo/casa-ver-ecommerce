/**
 * Migra order_items.imageUrl de Cloudinary → Bunny Storage.
 *
 * SOLO hace UPDATE del campo `imageUrl`. Nunca borra pedidos ni líneas de pedido.
 * Deduplica por URL Cloudinary: descarga/subida una vez, actualiza todas las filas.
 *
 * Uso:
 *   node scripts/migrate-order-items-to-bunny.mjs --dry-run
 *   node scripts/migrate-order-items-to-bunny.mjs --apply
 *   node scripts/migrate-order-items-to-bunny.mjs --apply --limit 5
 */
import { randomUUID } from "node:crypto";
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

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run") || !args.includes("--apply");
const LIMIT_FLAG = args.indexOf("--limit");
const LIMIT = LIMIT_FLAG >= 0 ? Number(args[LIMIT_FLAG + 1]) : null;

const ZONE = process.env.BUNNY_STORAGE_ZONE_NAME?.trim();
const KEY = process.env.BUNNY_STORAGE_ACCESS_KEY?.trim();
const HOST = process.env.BUNNY_STORAGE_HOST?.trim();
const CDN = process.env.NEXT_PUBLIC_BUNNY_CDN_URL?.trim().replace(/\/$/, "");

if (!ZONE || !KEY || !HOST || !CDN) {
  console.error(
    "Faltan BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_ACCESS_KEY, BUNNY_STORAGE_HOST o NEXT_PUBLIC_BUNNY_CDN_URL"
  );
  process.exit(1);
}

const prisma = new PrismaClient();

function isCloudinaryUrl(url) {
  try {
    return new URL(url).hostname.toLowerCase() === "res.cloudinary.com";
  } catch {
    return false;
  }
}

function extensionFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i);
    return match ? match[0].toLowerCase() : ".jpg";
  } catch {
    return ".jpg";
  }
}

/** HEIC en snapshots → subir como .jpg en Bunny */
function outputExtension(url) {
  const ext = extensionFromUrl(url);
  return ext === ".heic" || ext === ".heif" ? ".jpg" : ext;
}

function contentTypeFromExt(ext) {
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return map[ext] ?? "image/jpeg";
}

/** Inserta f_jpg en URLs Cloudinary para HEIC/HEIF */
function downloadUrl(cloudinaryUrl) {
  const ext = extensionFromUrl(cloudinaryUrl);
  if (ext !== ".heic" && ext !== ".heif") return cloudinaryUrl;
  return cloudinaryUrl.replace("/upload/", "/upload/f_jpg/");
}

function buildObjectKey(ext) {
  return `casa-verde/order-items/${randomUUID()}${ext}`;
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToBunny(buffer, objectKey, contentType) {
  const endpoint = `https://${HOST}/${ZONE}/${objectKey}`;
  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      AccessKey: KEY,
      "Content-Type": contentType,
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Bunny PUT failed (${res.status}): ${body}`);
  }
  return `${CDN}/${objectKey}`;
}

async function main() {
  console.log(DRY_RUN ? "=== DRY RUN (sin cambios) ===" : "=== APPLY (actualizará BD) ===");

  const rows = await prisma.orderItem.findMany({
    where: { imageUrl: { contains: "res.cloudinary.com" } },
    select: { id: true, imageUrl: true, sku: true },
  });

  const byUrl = new Map();
  for (const row of rows) {
    const url = row.imageUrl?.trim();
    if (!url || !isCloudinaryUrl(url)) continue;
    if (!byUrl.has(url)) byUrl.set(url, []);
    byUrl.get(url).push(row);
  }

  let uniqueUrls = [...byUrl.keys()];
  if (LIMIT != null && !Number.isNaN(LIMIT) && LIMIT > 0) {
    uniqueUrls = uniqueUrls.slice(0, LIMIT);
  }

  console.log(
    `Order items con Cloudinary: ${rows.length} filas, ${byUrl.size} URLs únicas` +
      (LIMIT ? ` (procesando ${uniqueUrls.length} URLs)` : "")
  );

  let migratedUrls = 0;
  let updatedRows = 0;
  let failed = 0;

  for (const oldUrl of uniqueUrls) {
    const items = byUrl.get(oldUrl);
    const outExt = outputExtension(oldUrl);
    const objectKey = buildObjectKey(outExt);
    const contentType = contentTypeFromExt(outExt);
    const newUrl = `${CDN}/${objectKey}`;

    console.log(`\n[${items.length} fila(s)] ${oldUrl.slice(0, 90)}...`);
    console.log(`  → ${newUrl}`);

    if (DRY_RUN) {
      migratedUrls++;
      updatedRows += items.length;
      continue;
    }

    try {
      const src = downloadUrl(oldUrl);
      const buffer = await download(src);
      const bunnyUrl = await uploadToBunny(buffer, objectKey, contentType);

      const result = await prisma.orderItem.updateMany({
        where: { imageUrl: oldUrl },
        data: { imageUrl: bunnyUrl },
      });

      console.log(`  OK → ${result.count} fila(s) actualizada(s)`);
      migratedUrls++;
      updatedRows += result.count;
    } catch (err) {
      console.error(`  FAIL: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log("\n=== Resumen ===");
  console.log({
    uniqueUrlsProcessed: migratedUrls,
    rowsUpdated: updatedRows,
    failed,
    mode: DRY_RUN ? "dry-run" : "apply",
  });

  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
