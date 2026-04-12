/**
 * Sin límite de tamaño desde el cliente — Cloudinary decide en el servidor.
 */
export function validateFileSize(_file: File): string | null {
  return null;
}

/**
 * Comprime una imagen usando Canvas antes de subirla a Cloudinary.
 *
 * - Solo aplica a imágenes (no videos).
 * - Redimensiona si el lado mayor supera maxDimension (por defecto 2400px).
 * - Reencoda como JPEG con calidad 0.85 — imperceptible visualmente.
 * - Convierte HEIC/HEIF a JPEG (los browsers modernos los soportan en Canvas).
 *
 * Resultado típico: foto iPhone 28 MB → ~2-3 MB, dentro del límite de Cloudinary.
 */
async function compressImage(file: File, maxDimension = 2400, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Redimensionar solo si supera el máximo
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
          if (!blob) { resolve(file); return; }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" }
          );
          // Solo usar la versión comprimida si realmente es más pequeña
          resolve(compressed.size < file.size ? compressed : file);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Si falla, subir original
    };

    img.src = objectUrl;
  });
}

/**
 * Sube un archivo a Cloudinary usando un upload FIRMADO.
 *
 * Para imágenes: comprime automáticamente antes de subir para mantenerse
 * dentro del límite del plan (10 MB). Las fotos de iPhone de 20-30 MB
 * se comprimen a ~2-3 MB sin pérdida visual perceptible.
 *
 * Flujo seguro:
 * 1. Solicita al servidor (/api/admin/upload/signature) una firma válida.
 *    El servidor verifica la sesión ADMIN antes de firmar — nunca expone el API secret.
 * 2. Sube el archivo directamente a Cloudinary con los parámetros firmados.
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video"
): Promise<string> {
  // Comprimir imágenes antes de subir para evitar el límite de 10 MB de Cloudinary
  const fileToUpload = resourceType === "image" ? await compressImage(file) : file;

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
  formData.append("file", fileToUpload);
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
