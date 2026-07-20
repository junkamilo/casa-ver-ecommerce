/**
 * Cliente de subida a Bunny.net vía proxy admin.
 * La Access Key nunca sale del servidor.
 */

/**
 * Sin límite estricto en cliente — el servidor / plan define el techo real.
 */
export function validateFileSize(_file: File): string | null {
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

/**
 * Sube un archivo a Bunny Storage a través de POST /api/admin/upload.
 *
 * Flujo:
 * 1. Comprime imágenes en el cliente.
 * 2. Envía el archivo al servidor (sesión ADMIN verificada).
 * 3. El servidor hace PUT a Bunny Storage y devuelve la URL pública del CDN.
 */
export async function uploadToBunny(
  file: File,
  resourceType: "image" | "video",
  folder = "products"
): Promise<string> {
  const fileToUpload = resourceType === "image" ? await compressImage(file) : file;

  const formData = new FormData();
  formData.append("file", fileToUpload);
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
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Error al subir archivo (${res.status})`
    );
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    throw new Error("Respuesta de subida inválida: falta URL");
  }

  return data.url;
}
