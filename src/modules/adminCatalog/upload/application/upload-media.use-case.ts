import {
  buildBunnyObjectKey,
  getBunnyStorageConfig,
  uploadBufferToBunny,
} from "@/lib/bunny-admin";

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

const ALLOWED_FOLDERS = new Set(["products", "categories", "heroes", "sets"]);

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB post-compresión
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export async function uploadMediaUseCase(input: {
  file: File;
  folder?: string;
  resourceType?: "image" | "video";
}): Promise<{ url: string; objectKey: string }> {
  const config = getBunnyStorageConfig();
  if (!config) {
    throw new BunnyUploadConfigError(
      "Faltan variables de entorno Bunny: BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_ACCESS_KEY, BUNNY_STORAGE_HOST o NEXT_PUBLIC_BUNNY_CDN_URL"
    );
  }

  const folder = (input.folder?.trim() || "products").toLowerCase();
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new BunnyUploadValidationError(`Folder no permitido: ${folder}`);
  }

  const resourceType =
    input.resourceType ??
    (input.file.type.startsWith("video/") ? "video" : "image");

  if (resourceType === "image" && input.file.size > MAX_IMAGE_BYTES) {
    throw new BunnyUploadValidationError("La imagen supera el límite de 15 MB");
  }
  if (resourceType === "video" && input.file.size > MAX_VIDEO_BYTES) {
    throw new BunnyUploadValidationError("El video supera el límite de 100 MB");
  }

  if (!input.file.type.startsWith("image/") && !input.file.type.startsWith("video/")) {
    throw new BunnyUploadValidationError("Solo se permiten imágenes o videos");
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
