// ─── Límites de tamaño por tipo de archivo ───────────────────────────────────
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Valida el tamaño del archivo antes de subirlo.
 * Retorna un mensaje de error o null si es válido.
 */
export function validateFileSize(file: File): string | null {
  const isVideo = file.type.startsWith("video");
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    const maxMB = Math.round(maxBytes / (1024 * 1024));
    return `"${file.name}" supera el límite de ${maxMB} MB`;
  }
  return null;
}

/**
 * Sube un archivo a Cloudinary usando un upload FIRMADO.
 *
 * Flujo seguro:
 * 1. Solicita al servidor (/api/admin/upload/signature) una firma válida.
 *    El servidor verifica la sesión ADMIN antes de firmar — nunca expone el API secret.
 * 2. Sube el archivo directamente a Cloudinary con los parámetros firmados.
 *
 * Esto reemplaza el upload sin firmar (unsigned preset) que era inseguro
 * porque cualquiera que conociera el preset podía subir archivos a la cuenta.
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video"
): Promise<string> {
  // 1. Obtener firma desde el servidor (verifica sesión admin internamente)
  const sigRes = await fetch("/api/admin/upload/signature", {
    cache: "no-store",
  });

  if (sigRes.status === 403) {
    throw new Error("Sin permisos para subir archivos. Verifica tu sesión.");
  }
  if (!sigRes.ok) {
    throw new Error(
      "Error al obtener autorización de subida. Intenta de nuevo."
    );
  }

  const { timestamp, signature, apiKey, cloudName, folder } =
    await sigRes.json();

  // 2. Subir a Cloudinary con parámetros firmados (sin preset público)
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", String(apiKey));
  formData.append("timestamp", String(timestamp));
  formData.append("signature", String(signature));
  formData.append("folder", String(folder));

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error?.message ?? `Error al subir archivo (${res.status})`
    );
  }

  const data = await res.json();
  const url: string = data.secure_url;

  if (resourceType === "video") {
    // Fuerza entrega como mp4 — convierte .mov/.hevc de iPhone automáticamente
    return url
      .replace("/upload/", "/upload/f_mp4/")
      .replace(/\.[^./]+$/, ".mp4");
  }

  // f_auto: convierte HEIC/HEIF a webp/jpg automáticamente
  // q_auto: optimiza calidad sin pérdida visible
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}
