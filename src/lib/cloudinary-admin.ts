import { createHash } from "crypto";

type CloudinaryResourceType = "image" | "video";

type ParsedCloudinaryAsset = {
  resourceType: CloudinaryResourceType;
  publicId: string;
};

function getCloudinaryConfig() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY ?? process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ?? process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado en el servidor");
  }

  return { cloudName, apiKey, apiSecret };
}

function normalizeUrls(urls: string[]): string[] {
  return [...new Set(urls.map((url) => url.trim()).filter(Boolean))];
}

function parseCloudinaryAsset(url: string): ParsedCloudinaryAsset | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") return null;

    const match = parsed.pathname.match(/\/(image|video)\/upload\/.+/);
    if (!match) return null;

    const resourceType = match[1] as CloudinaryResourceType;
    const rest = parsed.pathname.slice(match.index! + match[0].indexOf("/upload/") + "/upload/".length);

    // Cloudinary URLs de subida incluyen versión: /.../upload/<transformaciones>/v123/folder/file.ext
    const parts = rest.split("/").filter(Boolean);
    const versionIndex = parts.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdPath =
      versionIndex >= 0 ? parts.slice(versionIndex + 1).join("/") : parts.join("/");
    const publicId = publicIdPath.replace(/\.[^/.]+$/, "");

    if (!publicId) return null;
    return { resourceType, publicId };
  } catch {
    return null;
  }
}

async function destroyCloudinaryAsset(asset: ParsedCloudinaryAsset): Promise<void> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = `invalidate=true&public_id=${asset.publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  const params = new URLSearchParams();
  params.set("public_id", asset.publicId);
  params.set("timestamp", String(timestamp));
  params.set("signature", signature);
  params.set("api_key", apiKey);
  params.set("invalidate", "true");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${asset.resourceType}/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Cloudinary destroy failed (${response.status}): ${body}`);
  }
}

export async function deleteCloudinaryAssetsByUrls(urls: string[]): Promise<void> {
  const uniqueUrls = normalizeUrls(urls);
  if (uniqueUrls.length === 0) return;

  const parsedAssets = uniqueUrls
    .map(parseCloudinaryAsset)
    .filter((asset): asset is ParsedCloudinaryAsset => asset !== null);

  if (parsedAssets.length === 0) return;

  const deletions = await Promise.allSettled(parsedAssets.map((asset) => destroyCloudinaryAsset(asset)));

  const failed = deletions.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    throw new Error(`No se pudieron eliminar ${failed.length} archivo(s) en Cloudinary`);
  }
}
