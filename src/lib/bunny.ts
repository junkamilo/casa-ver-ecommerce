/**
 * Cliente de subida a Bunny.net vía proxy admin.
 * La Access Key nunca sale del servidor.
 *
 * Heroes imágenes: usar uploadHeroImageVariant (hero-upload.ts).
 * Catálogo / resto: uploadToBunny.
 */

import {
  PROXY_SAFE_MAX_BYTES,
  UPLOAD_CHUNK_BYTES,
  bytesToMbLabel,
  getUploadLimitsForFolder,
  HERO_VIDEO,
  type HeroImageVariant,
} from "@/lib/upload-limits";
import { uploadChunksParallel } from "@/lib/upload-chunk-pool";
import {
  createChunkProgressEvent,
  createPhaseEvent,
  type UploadProgressEvent,
} from "@/lib/upload-progress";
import {
  markUploadPhase,
  markUploadStart,
  measureUpload,
} from "@/lib/upload-perf";

/** Umbral alineado con PROXY_SAFE_MAX_BYTES del servidor. */
const CHUNKED_THRESHOLD_BYTES = PROXY_SAFE_MAX_BYTES;
const DEFAULT_CHUNK_BYTES = UPLOAD_CHUNK_BYTES;

export type UploadBunnyOptions = {
  heroVariant?: HeroImageVariant;
  heroProcessed?: boolean;
  onProgress?: (event: UploadProgressEvent) => void;
  perfId?: string;
};

/**
 * Validación temprana en cliente (catálogo y video hero).
 * Imágenes hero: usar validateHeroInputFile en hero-upload.ts.
 */
export function validateFileSize(
  file: File,
  resourceType?: "image" | "video",
  folder = "products",
): string | null {
  const type =
    resourceType ??
    (file.type.startsWith("video/") ? "video" : "image");
  const { maxImageBytes, maxVideoBytes } = getUploadLimitsForFolder(folder);

  if (folder === "heroes" && type === "image") {
    return null;
  }

  if (type === "image" && file.size > maxImageBytes) {
    return `La imagen supera el límite de ${bytesToMbLabel(maxImageBytes)} MB`;
  }
  if (type === "video" && file.size > maxVideoBytes) {
    return `El video supera el límite de ${bytesToMbLabel(maxVideoBytes)} MB`;
  }
  return null;
}

function readVideoDurationSec(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? video.duration : 0);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la duración del video"));
    };
    video.src = url;
  });
}

async function compressImage(
  file: File,
  maxDimension = 2400,
  quality = 0.85,
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
            type: "image/jpeg",
          });
          resolve(compressed.size < file.size ? compressed : file);
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

async function parseErrorMessage(res: Response): Promise<string> {
  if (res.status === 413) {
    return "El archivo es demasiado grande para el servidor (límite de Vercel). Se intentará subida por partes.";
  }
  if (res.status === 408 || res.status === 504) {
    return "El video es muy grande para el servidor. Prueba un archivo más pequeño o contacta soporte.";
  }
  const err = await res.json().catch(() => ({}));
  const body = err as { error?: string; message?: string };
  return body.error ?? body.message ?? `Error al subir archivo (${res.status})`;
}

async function abortChunkedUpload(uploadId: string, totalChunks: number): Promise<void> {
  try {
    await fetch("/api/admin/upload/abort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, totalChunks }),
      cache: "no-store",
    });
  } catch {
    // Best-effort cleanup; do not block the original error.
  }
}

async function uploadViaProxy(
  file: File,
  resourceType: "image" | "video",
  folder: string,
  options?: UploadBunnyOptions,
): Promise<string> {
  const perfId = options?.perfId;
  if (perfId) markUploadPhase(perfId, "direct-upload");
  options?.onProgress?.(createPhaseEvent("uploading", { progress: 50 }));

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("resourceType", resourceType);
  if (options?.heroVariant) {
    formData.append("heroVariant", options.heroVariant);
  }
  if (options?.heroProcessed) {
    formData.append("heroProcessed", "true");
  }

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (res.status === 403) {
    throw new Error("Sin permisos para subir archivos. Verifica tu sesión.");
  }

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    throw new Error("Respuesta de subida inválida: falta URL");
  }

  options?.onProgress?.(createPhaseEvent("uploading", { progress: 100 }));
  return data.url;
}

async function postChunk(
  uploadId: string,
  index: number,
  blob: Blob,
): Promise<void> {
  const formData = new FormData();
  formData.append("uploadId", uploadId);
  formData.append("index", String(index));
  formData.append("chunk", blob, `part-${index}`);

  const chunkRes = await fetch("/api/admin/upload/chunk", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (chunkRes.status === 403) {
    throw new Error("Sin permisos para subir archivos. Verifica tu sesión.");
  }
  if (!chunkRes.ok) {
    throw new Error(await parseErrorMessage(chunkRes));
  }
}

type DirectChunkUploadCredentials = {
  storageHost: string;
  zoneName: string;
  accessKey: string;
  pathPrefix: string;
};

async function fetchDirectChunkCredentials(
  uploadId: string,
): Promise<DirectChunkUploadCredentials> {
  const res = await fetch("/api/admin/upload/direct-credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
    cache: "no-store",
  });

  if (res.status === 403) {
    throw new Error("Sin permisos para subir archivos. Verifica tu sesión.");
  }
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }

  return (await res.json()) as DirectChunkUploadCredentials;
}

async function putChunkDirectToBunny(
  credentials: DirectChunkUploadCredentials,
  index: number,
  blob: Blob,
): Promise<void> {
  const objectKey = `${credentials.pathPrefix}/${String(index).padStart(5, "0")}`;
  const endpoint = `https://${credentials.storageHost}/${credentials.zoneName}/${objectKey}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      AccessKey: credentials.accessKey,
      "Content-Type": "application/octet-stream",
    },
    body: blob,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      body || `Error al subir parte ${index + 1} directamente a Bunny (${res.status})`,
    );
  }
}

async function uploadChunked(
  file: File,
  resourceType: "image" | "video",
  folder: string,
  options?: UploadBunnyOptions,
): Promise<string> {
  const perfId = options?.perfId;
  const contentType =
    file.type ||
    (resourceType === "video" ? "video/mp4" : "application/octet-stream");

  if (perfId) markUploadPhase(perfId, "chunk-init");

  const initBody: Record<string, unknown> = {
    fileName: file.name,
    contentType,
    fileSize: file.size,
    folder,
    resourceType,
  };
  if (options?.heroVariant) initBody.heroVariant = options.heroVariant;
  if (options?.heroProcessed) initBody.heroProcessed = true;

  const initRes = await fetch("/api/admin/upload/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(initBody),
    cache: "no-store",
  });

  if (initRes.status === 403) {
    throw new Error("Sin permisos para subir archivos. Verifica tu sesión.");
  }
  if (!initRes.ok) {
    throw new Error(await parseErrorMessage(initRes));
  }

  const { uploadId, chunkSize } = (await initRes.json()) as {
    uploadId: string;
    chunkSize?: number;
  };
  const size = chunkSize && chunkSize > 0 ? chunkSize : DEFAULT_CHUNK_BYTES;
  const totalChunks = Math.ceil(file.size / size);
  const useDirectBunnyChunks = folder === "heroes" && resourceType === "video";

  if (perfId) markUploadPhase(perfId, "chunk-upload");

  try {
    const uploadChunkFn = useDirectBunnyChunks
      ? await (async () => {
          const credentials = await fetchDirectChunkCredentials(uploadId);
          return async (index: number, blob: Blob) => {
            if (perfId) markUploadPhase(perfId, `chunk-${index}`);
            await putChunkDirectToBunny(credentials, index, blob);
          };
        })()
      : async (index: number, blob: Blob) => {
          if (perfId) markUploadPhase(perfId, `chunk-${index}`);
          await postChunk(uploadId, index, blob);
        };

    await uploadChunksParallel({
      file,
      chunkSize: size,
      uploadChunk: uploadChunkFn,
      onProgress: (completed, total) => {
        options?.onProgress?.(createChunkProgressEvent(completed, total));
      },
    });

    if (perfId) markUploadPhase(perfId, "chunk-complete");
    options?.onProgress?.(
      createPhaseEvent("assembling", {
        progress: null,
      }),
    );

    const completeBody: Record<string, unknown> = {
      uploadId,
      totalChunks,
      fileName: file.name,
      contentType,
      fileSize: file.size,
      folder,
      resourceType,
    };
    if (options?.heroVariant) completeBody.heroVariant = options.heroVariant;
    if (options?.heroProcessed) completeBody.heroProcessed = true;

    const completeRes = await fetch("/api/admin/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(completeBody),
      cache: "no-store",
    });

    if (completeRes.status === 403) {
      throw new Error("Sin permisos para subir archivos. Verifica tu sesión.");
    }
    if (!completeRes.ok) {
      throw new Error(await parseErrorMessage(completeRes));
    }

    const data = (await completeRes.json()) as { url?: string };
    if (!data.url) {
      throw new Error("Respuesta de subida inválida: falta URL");
    }

    options?.onProgress?.(createPhaseEvent("uploading", { progress: 100 }));
    return data.url;
  } catch (error) {
    await abortChunkedUpload(uploadId, totalChunks);
    const message = error instanceof Error ? error.message : "";
    if (
      message.toLowerCase().includes("timeout") ||
      message.includes("504") ||
      message.includes("408")
    ) {
      throw new Error(
        "El video es muy grande para el servidor. Prueba un archivo más pequeño o contacta soporte.",
      );
    }
    throw error;
  }
}

async function uploadFileInternal(
  file: File,
  resourceType: "image" | "video",
  folder: string,
  options?: UploadBunnyOptions,
): Promise<string> {
  const mustChunk =
    resourceType === "video" || file.size > CHUNKED_THRESHOLD_BYTES;

  if (mustChunk) {
    return uploadChunked(file, resourceType, folder, options);
  }

  try {
    return await uploadViaProxy(file, resourceType, folder, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("413") || message.toLowerCase().includes("demasiado grande")) {
      return uploadChunked(file, resourceType, folder, options);
    }
    throw error;
  }
}

/** Subida de archivo ya procesado (p. ej. WebP hero). */
export async function uploadProcessedFileToBunny(
  file: File,
  resourceType: "image" | "video",
  folder: string,
  options?: UploadBunnyOptions,
): Promise<string> {
  return uploadFileInternal(file, resourceType, folder, options);
}

/** Video hero: valida duración + sube MP4. */
export async function uploadHeroVideoToBunny(
  file: File,
  options?: Pick<UploadBunnyOptions, "onProgress" | "perfId">,
): Promise<string> {
  const perfId = options?.perfId ?? crypto.randomUUID();
  markUploadStart(perfId, { type: "hero-video", bytes: String(file.size) });

  options?.onProgress?.(createPhaseEvent("reading_metadata", { progress: 2 }));
  markUploadPhase(perfId, "reading-metadata");

  const duration = await readVideoDurationSec(file);
  if (duration > HERO_VIDEO.maxDurationSec) {
    throw new Error(
      `El video de hero no puede superar ${HERO_VIDEO.maxDurationSec} segundos (duración: ${Math.round(duration)}s)`,
    );
  }

  options?.onProgress?.(createPhaseEvent("uploading_chunks", { progress: 5 }));

  try {
    const url = await uploadFileInternal(file, "video", "heroes", {
      ...options,
      perfId,
    });
    measureUpload(perfId);
    return url;
  } catch (err) {
    measureUpload(perfId);
    throw err;
  }
}

/**
 * Sube un archivo a Bunny Storage (catálogo y folders no-hero).
 */
export async function uploadToBunny(
  file: File,
  resourceType: "image" | "video",
  folder = "products",
  options?: Pick<UploadBunnyOptions, "onProgress">,
): Promise<string> {
  if (folder === "heroes") {
    throw new Error(
      "Para banners usa uploadHeroImageVariant o uploadHeroVideo desde el admin de hero.",
    );
  }

  const earlyError = validateFileSize(file, resourceType, folder);
  if (earlyError) throw new Error(earlyError);

  const fileToUpload =
    resourceType === "image"
      ? await compressImage(file, 2400, 0.85)
      : file;

  const afterCompressError = validateFileSize(fileToUpload, resourceType, folder);
  if (afterCompressError) throw new Error(afterCompressError);

  return uploadFileInternal(fileToUpload, resourceType, folder, options);
}
