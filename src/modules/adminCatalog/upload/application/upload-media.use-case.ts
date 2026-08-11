import { Readable } from "stream";
import { randomUUID } from "crypto";
import {
  createReadStream,
  createWriteStream,
  promises as fs,
} from "fs";
import os from "os";
import path from "path";
import { finished } from "stream/promises";
import {
  buildBunnyObjectKey,
  getBunnyStorageConfig,
  toBunnyPublicUrl,
  uploadBufferToBunny,
  type BunnyStorageConfig,
} from "@/lib/bunny-admin";
import {
  MAX_IMAGE_BYTES,
  MAX_UPLOAD_CHUNKS,
  MAX_VIDEO_BYTES,
  PROXY_SAFE_MAX_BYTES,
  UPLOAD_CHUNK_BYTES,
  bytesToMbLabel,
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
}): void {
  if (
    !input.mimeType.startsWith("image/") &&
    !input.mimeType.startsWith("video/")
  ) {
    throw new BunnyUploadValidationError("Solo se permiten imágenes o videos");
  }
  if (input.resourceType === "image" && input.fileSize > MAX_IMAGE_BYTES) {
    throw new BunnyUploadValidationError(
      `La imagen supera el límite de ${bytesToMbLabel(MAX_IMAGE_BYTES)} MB`
    );
  }
  if (input.resourceType === "video" && input.fileSize > MAX_VIDEO_BYTES) {
    throw new BunnyUploadValidationError(
      `El video supera el límite de ${bytesToMbLabel(MAX_VIDEO_BYTES)} MB`
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
}): Promise<{ url: string; objectKey: string }> {
  const config = requireBunnyConfig();
  const folder = normalizeUploadFolder(input.folder);
  const resourceType = resolveResourceType(input.resourceType, input.file.type);

  assertUploadConstraints({
    resourceType,
    mimeType: input.file.type,
    fileSize: input.file.size,
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

async function downloadBunnyObject(
  objectKey: string,
  config: BunnyStorageConfig
): Promise<Buffer> {
  const endpoint = `https://${config.storageHost}/${config.zoneName}/${objectKey}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { AccessKey: config.accessKey },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `No se pudo leer parte temporal (${response.status}): ${body}`
    );
  }
  return Buffer.from(await response.arrayBuffer());
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

async function uploadFilePathToBunny(input: {
  filePath: string;
  fileSize: number;
  objectKey: string;
  contentType: string;
  config: BunnyStorageConfig;
}): Promise<string> {
  const endpoint = `https://${input.config.storageHost}/${input.config.zoneName}/${input.objectKey}`;
  const nodeStream = createReadStream(input.filePath);
  const webStream = Readable.toWeb(nodeStream) as unknown as BodyInit;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      AccessKey: input.config.accessKey,
      "Content-Type": input.contentType || "application/octet-stream",
      "Content-Length": String(input.fileSize),
    },
    // Node fetch requiere duplex al enviar streams
    duplex: "half",
    body: webStream,
  } as RequestInit & { duplex: "half" });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Bunny upload failed (${response.status}): ${body}`);
  }

  return toBunnyPublicUrl(input.config.cdnBaseUrl, input.objectKey);
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
  });

  const partKeys = Array.from({ length: input.totalChunks }, (_, i) =>
    tempChunkObjectKey(input.uploadId, i)
  );

  const tmpDir = path.join(os.tmpdir(), `cv-upload-${input.uploadId}`);
  const finalPath = path.join(tmpDir, "final.bin");
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    const writeStream = createWriteStream(finalPath);
    let assembled = 0;

    for (let i = 0; i < partKeys.length; i += 1) {
      const part = await downloadBunnyObject(partKeys[i], config);
      assembled += part.length;
      const canContinue = writeStream.write(part);
      if (!canContinue) {
        await new Promise<void>((resolve) => writeStream.once("drain", resolve));
      }
    }
    writeStream.end();
    await finished(writeStream);

    const delta = Math.abs(assembled - input.fileSize);
    if (delta > 1024) {
      throw new BunnyUploadValidationError(
        `Tamaño final inconsistente (esperado ${input.fileSize}, recibido ${assembled})`
      );
    }

    const objectKey = buildBunnyObjectKey(
      input.fileName,
      input.contentType,
      folder
    );

    const url = await uploadFilePathToBunny({
      filePath: finalPath,
      fileSize: assembled,
      objectKey,
      contentType: input.contentType || "application/octet-stream",
      config,
    });

    await Promise.allSettled(
      partKeys.map((key) => deleteBunnyObjectKey(key, config))
    );

    return { url, objectKey };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function initChunkedUploadUseCase(input: {
  fileName: string;
  contentType: string;
  fileSize: number;
  folder?: string;
  resourceType?: "image" | "video";
}): Promise<{ uploadId: string; chunkSize: number }> {
  requireBunnyConfig();
  normalizeUploadFolder(input.folder);
  const resourceType = resolveResourceType(input.resourceType, input.contentType);
  assertUploadConstraints({
    resourceType,
    mimeType: input.contentType,
    fileSize: input.fileSize,
  });

  const estimatedChunks = Math.ceil(input.fileSize / UPLOAD_CHUNK_BYTES);
  if (estimatedChunks > MAX_UPLOAD_CHUNKS) {
    throw new BunnyUploadValidationError(
      `El archivo requiere demasiadas partes (${estimatedChunks}). Reduce el tamaño o contacta soporte.`
    );
  }

  return { uploadId: randomUUID(), chunkSize: UPLOAD_CHUNK_BYTES };
}
