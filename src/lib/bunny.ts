/**
 * Cliente de subida a Bunny.net vía proxy admin.
 * La Access Key nunca sale del servidor.
 *
 * Videos y archivos grandes usan subida por partes (evita HTTP 413 de Vercel,
 * límite ~4.5 MB por request en serverless).
 */

import {
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  PROXY_SAFE_MAX_BYTES,
  UPLOAD_CHUNK_BYTES,
  bytesToMbLabel,
} from "@/lib/upload-limits";

/** Umbral alineado con PROXY_SAFE_MAX_BYTES del servidor. */
const CHUNKED_THRESHOLD_BYTES = PROXY_SAFE_MAX_BYTES;
const DEFAULT_CHUNK_BYTES = UPLOAD_CHUNK_BYTES;

/**
 * Validación temprana en cliente (misma regla que el servidor).
 */
export function validateFileSize(
  file: File,
  resourceType?: "image" | "video"
): string | null {
  const type =
    resourceType ??
    (file.type.startsWith("video/") ? "video" : "image");

  if (type === "image" && file.size > MAX_IMAGE_BYTES) {
    return `La imagen supera el límite de ${bytesToMbLabel(MAX_IMAGE_BYTES)} MB`;
  }
  if (type === "video" && file.size > MAX_VIDEO_BYTES) {
    return `El video supera el límite de ${bytesToMbLabel(MAX_VIDEO_BYTES)} MB`;
  }
  return null;
}

/**
 * Comprime una imagen con Canvas antes de subirla.
 * - Redimensiona si el lado mayor supera maxDimension (2400px).
 * - Reencoda JPEG calidad 0.85.
 * - Convierte HEIC/HEIF cuando el browser lo soporta en Canvas.
 */
async function compressImage(file: File, maxDimension = 2400, quality = 0.85): Promise<File> {
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
        quality
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
  const err = await res.json().catch(() => ({}));
  return (
    (err as { error?: string }).error ?? `Error al subir archivo (${res.status})`
  );
}

async function uploadViaProxy(
  file: File,
  resourceType: "image" | "video",
  folder: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("resourceType", resourceType);

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
  return data.url;
}

async function uploadChunked(
  file: File,
  resourceType: "image" | "video",
  folder: string
): Promise<string> {
  const contentType =
    file.type ||
    (resourceType === "video" ? "video/mp4" : "application/octet-stream");

  const initRes = await fetch("/api/admin/upload/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType,
      fileSize: file.size,
      folder,
      resourceType,
    }),
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

  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * size;
    const end = Math.min(start + size, file.size);
    const blob = file.slice(start, end);

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

  const completeRes = await fetch("/api/admin/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uploadId,
      totalChunks,
      fileName: file.name,
      contentType,
      fileSize: file.size,
      folder,
      resourceType,
    }),
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
  return data.url;
}

/**
 * Sube un archivo a Bunny Storage.
 *
 * - Imágenes pequeñas: POST /api/admin/upload (proxy).
 * - Videos o archivos > ~3.5 MB: subida por partes (init → chunk → complete).
 */
export async function uploadToBunny(
  file: File,
  resourceType: "image" | "video",
  folder = "products"
): Promise<string> {
  const earlyError = validateFileSize(file, resourceType);
  if (earlyError) throw new Error(earlyError);

  const fileToUpload =
    resourceType === "image" ? await compressImage(file) : file;

  const afterCompressError = validateFileSize(fileToUpload, resourceType);
  if (afterCompressError) throw new Error(afterCompressError);

  const mustChunk =
    resourceType === "video" || fileToUpload.size > CHUNKED_THRESHOLD_BYTES;

  if (mustChunk) {
    return uploadChunked(fileToUpload, resourceType, folder);
  }

  try {
    return await uploadViaProxy(fileToUpload, resourceType, folder);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // Si Vercel devolvió 413 u otro límite, reintentar por partes.
    if (message.includes("413") || message.toLowerCase().includes("demasiado grande")) {
      return uploadChunked(fileToUpload, resourceType, folder);
    }
    throw error;
  }
}
