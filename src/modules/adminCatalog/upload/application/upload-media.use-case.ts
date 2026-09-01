import { Readable } from "stream";
import { randomUUID } from "crypto";
import {
  buildBunnyObjectKey,
  getBunnyStorageConfig,
  listBunnyPrefix,
  toBunnyPublicUrl,
  uploadBufferToBunny,
  type BunnyStorageConfig,
} from "@/lib/bunny-admin";
import { createServerUploadTimer } from "@/lib/upload-perf";
import {
  MAX_IMAGE_BYTES,
  MAX_UPLOAD_CHUNKS,
  MAX_VIDEO_BYTES,
  PROXY_SAFE_MAX_BYTES,
  UPLOAD_CHUNK_BYTES,
  bytesToMbLabel,
  getUploadLimitsForFolder,
  HERO_IMAGE_MIME_ALLOWLIST,
  HERO_VIDEO_MIME_ALLOWLIST,
  HERO_IMAGE,
  HERO_VIDEO,
  getHeroVariantMaxOutputBytes,
  isHeroImageVariant,
  type HeroImageVariant,
} from "@/lib/upload-limits";

export class BunnyUploadConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BunnyUploadConfigError";
  }
}

export class BunnyUploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BunnyUploadValidationError";
  }
}

export const ALLOWED_UPLOAD_FOLDERS = new Set([
  "products",
  "categories",
  "heroes",
  "sets",
]);

export {
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  MAX_UPLOAD_CHUNKS,
  PROXY_SAFE_MAX_BYTES,
  UPLOAD_CHUNK_BYTES,
};

export function requireBunnyConfig(): BunnyStorageConfig {
  const config = getBunnyStorageConfig();
  if (!config) {
    throw new BunnyUploadConfigError(
      "Faltan variables de entorno Bunny: BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_ACCESS_KEY, BUNNY_STORAGE_HOST o NEXT_PUBLIC_BUNNY_CDN_URL"
    );
  }
  return config;
}

export function normalizeUploadFolder(folder?: string): string {
  const normalized = (folder?.trim() || "products").toLowerCase();
  if (!ALLOWED_UPLOAD_FOLDERS.has(normalized)) {
    throw new BunnyUploadValidationError(`Folder no permitido: ${folder}`);
  }
  return normalized;
}

export function resolveResourceType(
  resourceType: "image" | "video" | undefined,
  mimeType: string
): "image" | "video" {
  if (resourceType === "image" || resourceType === "video") return resourceType;
  return mimeType.startsWith("video/") ? "video" : "image";
}

export function assertUploadConstraints(input: {
  resourceType: "image" | "video";
  mimeType: string;
  fileSize: number;
  folder?: string;
  heroVariant?: HeroImageVariant;
  /** true when client already ran WebP pipeline (heroes images). */
  heroProcessed?: boolean;
}): void {
  const mime = (input.mimeType || "").toLowerCase().split(";")[0].trim();
  const folder = input.folder ?? "products";
  const { maxImageBytes, maxVideoBytes } = getUploadLimitsForFolder(folder);

  if (folder === "heroes") {
    if (input.resourceType === "image") {
      if (input.heroProcessed) {
        if (mime !== HERO_IMAGE.outputMime) {
          throw new BunnyUploadValidationError(
            "Heroes: la imagen procesada debe ser WebP",
          );
        }
        if (!input.heroVariant || !isHeroImageVariant(input.heroVariant)) {
          throw new BunnyUploadValidationError(
            "Heroes: heroVariant requerido (desktop, tablet o mobile)",
          );
        }
        const maxOut = getHeroVariantMaxOutputBytes(input.heroVariant);
        if (input.fileSize > maxOut) {
          throw new BunnyUploadValidationError(
            `La imagen ${input.heroVariant} supera el objetivo de salida (${Math.round(maxOut / 1024)} KB)`,
          );
        }
        return;
      }

      if (!HERO_IMAGE_MIME_ALLOWLIST.has(mime)) {
        throw new BunnyUploadValidationError(
          "Heroes: solo JPEG, PNG, WebP o GIF (no SVG). Sube desde el admin para procesar automáticamente.",
        );
      }
      if (input.fileSize > HERO_IMAGE.maxInputBytes) {
        throw new BunnyUploadValidationError(
          `La imagen supera el límite de entrada de ${bytesToMbLabel(HERO_IMAGE.maxInputBytes)} MB`,
        );
      }
      return;
    }

    if (input.resourceType === "video") {
      if (!HERO_VIDEO_MIME_ALLOWLIST.has(mime)) {
        throw new BunnyUploadValidationError(
          "Heroes: solo MP4 (H.264). Exporta el video como MP4.",
        );
      }
      if (input.fileSize > HERO_VIDEO.maxInputBytes) {
        throw new BunnyUploadValidationError(
          `El video supera el límite de ${bytesToMbLabel(HERO_VIDEO.maxInputBytes)} MB`,
        );
      }
      return;
    }
  }

  if (!mime.startsWith("image/") && !mime.startsWith("video/")) {
    throw new BunnyUploadValidationError("Solo se permiten imágenes o videos");
  }

  if (mime === "image/svg+xml") {
    throw new BunnyUploadValidationError("SVG no permitido");
  }

  if (input.resourceType === "image" && input.fileSize > maxImageBytes) {
    throw new BunnyUploadValidationError(
      `La imagen supera el límite de ${bytesToMbLabel(maxImageBytes)} MB`,
    );
  }
  if (input.resourceType === "video" && input.fileSize > maxVideoBytes) {
    throw new BunnyUploadValidationError(
      `El video supera el límite de ${bytesToMbLabel(maxVideoBytes)} MB`,
    );
  }
}

export function assertValidUploadId(uploadId: string): void {
  if (!/^[a-z0-9-]{10,80}$/i.test(uploadId)) {
    throw new BunnyUploadValidationError("uploadId inválido");
  }
}

export function tempChunkObjectKey(uploadId: string, index: number): string {
  return `casa-verde/_tmp/${uploadId}/${String(index).padStart(5, "0")}`;
}

export async function uploadMediaUseCase(input: {
  file: File;
  folder?: string;
  resourceType?: "image" | "video";
  heroVariant?: HeroImageVariant;
  heroProcessed?: boolean;
}): Promise<{ url: string; objectKey: string }> {
  const config = requireBunnyConfig();
  const folder = normalizeUploadFolder(input.folder);
  const resourceType = resolveResourceType(input.resourceType, input.file.type);

  assertUploadConstraints({
    resourceType,
    mimeType: input.file.type,
    fileSize: input.file.size,
    folder,
    heroVariant: input.heroVariant,
    heroProcessed: input.heroProcessed,
  });

  if (input.file.size > PROXY_SAFE_MAX_BYTES) {
    throw new BunnyUploadValidationError(
      "Archivo demasiado grande para subida directa por el servidor (límite ~4.5 MB en Vercel). Usa la subida por partes."
    );
  }

  const objectKey = buildBunnyObjectKey(input.file.name, input.file.type, folder);
  const buffer = Buffer.from(await input.file.arrayBuffer());

  const url = await uploadBufferToBunny({
    buffer,
    objectKey,
    contentType: input.file.type || "application/octet-stream",
    config,
  });

  return { url, objectKey };
}

async function downloadBunnyObjectStream(
  objectKey: string,
  config: BunnyStorageConfig,
  partLabel?: string,
): Promise<ReadableStream<Uint8Array>> {
  const endpoint = `https://${config.storageHost}/${config.zoneName}/${objectKey}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { AccessKey: config.accessKey },
  });
  if (response.status === 404) {
    throw new BunnyUploadValidationError(
      partLabel
        ? `Falta la ${partLabel}. Reintenta la subida.`
        : "Falta una parte de la subida. Reintenta.",
    );
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `No se pudo leer parte temporal (${response.status}): ${body}`,
    );
  }
  if (!response.body) {
    throw new Error("Respuesta de Bunny sin body");
  }
  return response.body;
}

async function* orderedPartByteChunks(
  partKeys: string[],
  config: BunnyStorageConfig,
): AsyncGenerator<Uint8Array> {
  for (let i = 0; i < partKeys.length; i += 1) {
    const key = partKeys[i]!;
    const partLabel = `parte ${i + 1} de ${partKeys.length}`;
    const body = await downloadBunnyObjectStream(key, config, partLabel);
    const reader = body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }
}

function createOrderedPartsReadable(
  partKeys: string[],
  config: BunnyStorageConfig,
): Readable {
  return Readable.from(orderedPartByteChunks(partKeys, config));
}

async function uploadStreamToBunny(input: {
  stream: Readable;
  fileSize: number;
  objectKey: string;
  contentType: string;
  config: BunnyStorageConfig;
}): Promise<string> {
  const endpoint = `https://${input.config.storageHost}/${input.config.zoneName}/${input.objectKey}`;
  const webStream = Readable.toWeb(input.stream) as unknown as BodyInit;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      AccessKey: input.config.accessKey,
      "Content-Type": input.contentType || "application/octet-stream",
      "Content-Length": String(input.fileSize),
    },
    duplex: "half",
    body: webStream,
  } as RequestInit & { duplex: "half" });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Bunny upload failed (${response.status}): ${body}`);
  }

  return toBunnyPublicUrl(input.config.cdnBaseUrl, input.objectKey);
}

async function deleteBunnyObjectKey(
  objectKey: string,
  config: BunnyStorageConfig
): Promise<void> {
  const endpoint = `https://${config.storageHost}/${config.zoneName}/${objectKey}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: { AccessKey: config.accessKey },
  });
  if (!response.ok && response.status !== 404) {
    const body = await response.text().catch(() => "");
    throw new Error(`Bunny delete failed (${response.status}): ${body}`);
  }
}

export async function cleanupTempChunks(input: {
  uploadId: string;
  totalChunks: number;
}): Promise<{ deleted: number; failed: number }> {
  const config = requireBunnyConfig();
  assertValidUploadId(input.uploadId);

  if (
    !Number.isInteger(input.totalChunks) ||
    input.totalChunks < 1 ||
    input.totalChunks > MAX_UPLOAD_CHUNKS
  ) {
    throw new BunnyUploadValidationError("totalChunks inválido");
  }

  const partKeys = Array.from({ length: input.totalChunks }, (_, i) =>
    tempChunkObjectKey(input.uploadId, i),
  );

  const results = await Promise.allSettled(
    partKeys.map((key) => deleteBunnyObjectKey(key, config)),
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return { deleted: partKeys.length - failed, failed };
}

export async function uploadChunkPartUseCase(input: {
  uploadId: string;
  index: number;
  chunk: File;
}): Promise<{ ok: true }> {
  const config = requireBunnyConfig();
  assertValidUploadId(input.uploadId);

  if (
    !Number.isInteger(input.index) ||
    input.index < 0 ||
    input.index >= MAX_UPLOAD_CHUNKS
  ) {
    throw new BunnyUploadValidationError("Índice de parte inválido");
  }
  if (input.chunk.size <= 0 || input.chunk.size > UPLOAD_CHUNK_BYTES + 64_000) {
    throw new BunnyUploadValidationError("Tamaño de parte inválido");
  }

  const objectKey = tempChunkObjectKey(input.uploadId, input.index);
  const buffer = Buffer.from(await input.chunk.arrayBuffer());
  await uploadBufferToBunny({
    buffer,
    objectKey,
    contentType: "application/octet-stream",
    config,
  });

  return { ok: true };
}

export async function completeChunkedUploadUseCase(input: {
  uploadId: string;
  totalChunks: number;
  fileName: string;
  contentType: string;
  folder?: string;
  resourceType?: "image" | "video";
  fileSize: number;
  heroVariant?: HeroImageVariant;
  heroProcessed?: boolean;
}): Promise<{ url: string; objectKey: string }> {
  const config = requireBunnyConfig();
  assertValidUploadId(input.uploadId);

  if (
    !Number.isInteger(input.totalChunks) ||
    input.totalChunks < 1 ||
    input.totalChunks > MAX_UPLOAD_CHUNKS
  ) {
    throw new BunnyUploadValidationError("totalChunks inválido");
  }

  const folder = normalizeUploadFolder(input.folder);
  const resourceType = resolveResourceType(input.resourceType, input.contentType);
  assertUploadConstraints({
    resourceType,
    mimeType: input.contentType,
    fileSize: input.fileSize,
    folder,
    heroVariant: input.heroVariant,
    heroProcessed: input.heroProcessed,
  });

  const partKeys = Array.from({ length: input.totalChunks }, (_, i) =>
    tempChunkObjectKey(input.uploadId, i)
  );

  const timer = createServerUploadTimer();

  timer.mark("assemble-stream");
  const orderedStream = createOrderedPartsReadable(partKeys, config);

  const objectKey = buildBunnyObjectKey(
    input.fileName,
    input.contentType,
    folder,
  );

  timer.mark("final-put");
  const url = await uploadStreamToBunny({
    stream: orderedStream,
    fileSize: input.fileSize,
    objectKey,
    contentType: input.contentType || "application/octet-stream",
    config,
  });

  timer.mark("cleanup");
  await Promise.allSettled(
    partKeys.map((key) => deleteBunnyObjectKey(key, config)),
  );

  if (process.env.NODE_ENV === "development") {
    const report = timer.report();
    console.info("[upload complete]", report);
  }

  return { url, objectKey };
}

export async function initChunkedUploadUseCase(input: {
  fileName: string;
  contentType: string;
  fileSize: number;
  folder?: string;
  resourceType?: "image" | "video";
  heroVariant?: HeroImageVariant;
  heroProcessed?: boolean;
}): Promise<{ uploadId: string; chunkSize: number }> {
  requireBunnyConfig();
  const folder = normalizeUploadFolder(input.folder);
  const resourceType = resolveResourceType(input.resourceType, input.contentType);
  assertUploadConstraints({
    resourceType,
    mimeType: input.contentType,
    fileSize: input.fileSize,
    folder,
    heroVariant: input.heroVariant,
    heroProcessed: input.heroProcessed,
  });

  const estimatedChunks = Math.ceil(input.fileSize / UPLOAD_CHUNK_BYTES);
  if (estimatedChunks > MAX_UPLOAD_CHUNKS) {
    throw new BunnyUploadValidationError(
      `El archivo requiere demasiadas partes (${estimatedChunks}). Reduce el tamaño o contacta soporte.`
    );
  }

  return { uploadId: randomUUID(), chunkSize: UPLOAD_CHUNK_BYTES };
}

export type DirectChunkUploadCredentials = {
  storageHost: string;
  zoneName: string;
  accessKey: string;
  pathPrefix: string;
};

/**
 * Credenciales para subir chunks directamente a Bunny desde el admin (evita proxy en cada parte).
 * Solo para sesiones admin autenticadas; el path queda acotado a casa-verde/_tmp/{uploadId}.
 */
export async function getDirectChunkUploadCredentialsUseCase(input: {
  uploadId: string;
}): Promise<DirectChunkUploadCredentials> {
  const config = requireBunnyConfig();
  assertValidUploadId(input.uploadId);
  return {
    storageHost: config.storageHost,
    zoneName: config.zoneName,
    accessKey: config.accessKey,
    pathPrefix: `casa-verde/_tmp/${input.uploadId}`,
  };
}

const TMP_UPLOAD_PREFIX = "casa-verde/_tmp";
const STALE_TMP_UPLOAD_MS = 24 * 60 * 60 * 1000;

export async function cleanupStaleTempUploadsUseCase(): Promise<{
  deletedUploads: number;
  deletedObjects: number;
  errors: number;
}> {
  const config = requireBunnyConfig();
  const uploads = await listBunnyPrefix(TMP_UPLOAD_PREFIX, config);
  const cutoff = Date.now() - STALE_TMP_UPLOAD_MS;

  let deletedUploads = 0;
  let deletedObjects = 0;
  let errors = 0;

  for (const entry of uploads) {
    if (!entry.IsDirectory) continue;
    const uploadId = entry.ObjectName;
    if (!/^[a-z0-9-]{10,80}$/i.test(uploadId)) continue;

    const partsPrefix = `${TMP_UPLOAD_PREFIX}/${uploadId}`;
    const parts = await listBunnyPrefix(partsPrefix, config);
    if (parts.length === 0) continue;

    const newestMs = parts.reduce((max, part) => {
      const changed = Date.parse(part.LastChanged);
      return Number.isFinite(changed) && changed > max ? changed : max;
    }, 0);

    if (newestMs > cutoff) continue;

    const fileParts = parts.filter((part) => !part.IsDirectory);
    const results = await Promise.allSettled(
      fileParts.map((part) =>
        deleteBunnyObjectKey(`${partsPrefix}/${part.ObjectName}`, config),
      ),
    );

    deletedUploads += 1;
    deletedObjects += results.filter((r) => r.status === "fulfilled").length;
    errors += results.filter((r) => r.status === "rejected").length;
  }

  return { deletedUploads, deletedObjects, errors };
}
