/**
 * Migra hero_slides.mediaUrl de Cloudinary → Bunny Storage.
 *
 * SOLO hace UPDATE del campo `mediaUrl`. Nunca borra slides ni otros registros.
 *
 * Uso:
 *   node scripts/migrate-hero-slides-to-bunny.mjs --dry-run
 *   node scripts/migrate-hero-slides-to-bunny.mjs --apply
 *   node scripts/migrate-hero-slides-to-bunny.mjs --apply --id cmo5x6veu00009jkq960ewd7u
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
const ID_FLAG = args.indexOf("--id");
const ONLY_ID = ID_FLAG >= 0 ? args[ID_FLAG + 1] : null;

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

function isBunnyUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "media.casaverdeoficial.com" || host === "casa-verde-cdn.b-cdn.net"
    );
  } catch {
    return false;
  }
}

function extensionFromUrl(url, mediaType) {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/\.(jpe?g|png|webp|gif|heic|heif|mp4|mov|webm|mkv|ogg|m4v)$/i);
    if (match) return match[0].toLowerCase();
  } catch {
    // ignore
  }
  return mediaType === "video" ? ".mp4" : ".jpg";
}

function contentTypeFromExt(ext) {
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".mkv": "video/x-matroska",
    ".ogg": "video/ogg",
    ".m4v": "video/x-m4v",
  };
  return map[ext] ?? "application/octet-stream";
}

function buildObjectKey(slide, ext) {
  const label = `slide-${slide.position}-${slide.mediaType}`;
  const safe = label.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `casa-verde/heroes/${randomUUID()}-${safe}${ext}`;
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

  const where = {
    mediaUrl: { contains: "res.cloudinary.com" },
    ...(ONLY_ID ? { id: ONLY_ID } : {}),
  };

  const slides = await prisma.heroSlide.findMany({
    where,
    select: {
      id: true,
      position: true,
      mediaType: true,
      mediaUrl: true,
      headline: true,
    },
    orderBy: { position: "asc" },
  });

  console.log(`Hero slides con Cloudinary: ${slides.length}`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const slide of slides) {
    const oldUrl = slide.mediaUrl?.trim() ?? "";
    if (!oldUrl) {
      console.log(`[SKIP] pos ${slide.position}: sin mediaUrl`);
      skipped++;
      continue;
    }
    if (isBunnyUrl(oldUrl)) {
      console.log(`[SKIP] pos ${slide.position}: ya es Bunny`);
      skipped++;
      continue;
    }
    if (!isCloudinaryUrl(oldUrl)) {
      console.log(`[SKIP] pos ${slide.position}: no es Cloudinary → ${oldUrl}`);
      skipped++;
      continue;
    }

    const ext = extensionFromUrl(oldUrl, slide.mediaType);
    const objectKey = buildObjectKey(slide, ext);
    const contentType = contentTypeFromExt(ext);

    console.log(`\n[pos ${slide.position}] ${slide.headline ?? "(sin headline)"}`);
    console.log(`  type: ${slide.mediaType}`);
    console.log(`  old: ${oldUrl}`);
    console.log(`  key: ${objectKey}`);

    if (DRY_RUN) {
      console.log(`  → dry-run: se migraría a ${CDN}/${objectKey}`);
      migrated++;
      continue;
    }

    try {
      const buffer = await download(oldUrl);
      const newUrl = await uploadToBunny(buffer, objectKey, contentType);

      await prisma.heroSlide.update({
        where: { id: slide.id },
        data: { mediaUrl: newUrl },
      });

      console.log(`  OK → ${newUrl}`);
      migrated++;
    } catch (err) {
      console.error(`  FAIL: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log("\n=== Resumen ===");
  console.log({ migrated, skipped, failed, mode: DRY_RUN ? "dry-run" : "apply" });

  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
