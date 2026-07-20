import { randomUUID } from "crypto";
import { isBunnyCdnUrl } from "@/lib/media-url";

export type BunnyStorageConfig = {
  zoneName: string;
  accessKey: string;
  storageHost: string;
  cdnBaseUrl: string;
};

export function getBunnyStorageConfig(): BunnyStorageConfig | null {
  const zoneName = process.env.BUNNY_STORAGE_ZONE_NAME?.trim();
  const accessKey = process.env.BUNNY_STORAGE_ACCESS_KEY?.trim();
  const storageHost = process.env.BUNNY_STORAGE_HOST?.trim();
  const cdnBaseUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL?.trim().replace(/\/$/, "");

  if (!zoneName || !accessKey || !storageHost || !cdnBaseUrl) {
    return null;
  }

  return { zoneName, accessKey, storageHost, cdnBaseUrl };
}

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return base.slice(0, 120) || "file";
}

function extensionFromFile(fileName: string, mimeType: string): string {
  const fromName = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
    : "";
  if (fromName && fromName.length <= 8) return fromName;

  const mimeMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/webm": ".webm",
  };
  return mimeMap[mimeType] ?? "";
}

/**
 * Construye la key de almacenamiento bajo `casa-verde/{folder}/...`.
 * Por defecto folder = products.
 */
export function buildBunnyObjectKey(
  fileName: string,
  mimeType: string,
  folder = "products"
): string {
  const safeFolder = folder.replace(/^\/+|\/+$/g, "") || "products";
  const ext = extensionFromFile(fileName, mimeType);
  const safeName = sanitizeFileName(
    fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName
  );
  return `casa-verde/${safeFolder}/${randomUUID()}-${safeName}${ext}`;
}

export function toBunnyPublicUrl(cdnBaseUrl: string, objectKey: string): string {
  return `${cdnBaseUrl.replace(/\/$/, "")}/${objectKey.replace(/^\//, "")}`;
}

/**
 * Extrae la object key desde una URL pública del CDN Bunny.
 * Ejemplo: https://media.casaverdeoficial.com/casa-verde/products/abc.jpg
 *       → casa-verde/products/abc.jpg
 */
export function parseBunnyObjectKey(url: string): string | null {
  if (!isBunnyCdnUrl(url)) return null;
  try {
    const parsed = new URL(url);
    const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    return key || null;
  } catch {
    return null;
  }
}

export async function uploadBufferToBunny(input: {
  buffer: Buffer;
  objectKey: string;
  contentType: string;
  config?: BunnyStorageConfig;
}): Promise<string> {
  const config = input.config ?? getBunnyStorageConfig();
  if (!config) {
    throw new Error(
      "Bunny.net no está configurado. Faltan BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_ACCESS_KEY, BUNNY_STORAGE_HOST o NEXT_PUBLIC_BUNNY_CDN_URL"
    );
  }

  const endpoint = `https://${config.storageHost}/${config.zoneName}/${input.objectKey}`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      AccessKey: config.accessKey,
      "Content-Type": input.contentType || "application/octet-stream",
    },
    body: new Uint8Array(input.buffer),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Bunny upload failed (${response.status}): ${body}`);
  }

  return toBunnyPublicUrl(config.cdnBaseUrl, input.objectKey);
}

async function deleteBunnyObject(objectKey: string, config: BunnyStorageConfig): Promise<void> {
  const endpoint = `https://${config.storageHost}/${config.zoneName}/${objectKey}`;

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: { AccessKey: config.accessKey },
  });

  // 404 = ya no existe — no es error
  if (!response.ok && response.status !== 404) {
    const body = await response.text().catch(() => "");
    throw new Error(`Bunny delete failed (${response.status}): ${body}`);
  }
}

export async function deleteBunnyAssetsByUrls(urls: string[]): Promise<void> {
  const config = getBunnyStorageConfig();
  if (!config) return;

  const keys = [
    ...new Set(
      urls
        .map((url) => url.trim())
        .filter(Boolean)
        .map(parseBunnyObjectKey)
        .filter((key): key is string => Boolean(key))
    ),
  ];

  if (keys.length === 0) return;

  const results = await Promise.allSettled(keys.map((key) => deleteBunnyObject(key, config)));
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    throw new Error(`No se pudieron eliminar ${failed.length} archivo(s) en Bunny.net`);
  }
}
