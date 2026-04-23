export function collectBodyAssetUrls(body: Record<string, unknown>): string[] {
  const urls: string[] = [];

  if (typeof body.videoUrl === "string" && body.videoUrl.trim()) {
    urls.push(body.videoUrl.trim());
  }

  const colors = Array.isArray(body.colors) ? body.colors : [];
  for (const color of colors) {
    if (!color || typeof color !== "object") continue;
    const images = Array.isArray((color as { images?: unknown }).images)
      ? (color as { images: unknown[] }).images
      : [];
    for (const image of images) {
      if (typeof image === "string" && image.trim()) urls.push(image.trim());
    }
  }

  const items = Array.isArray(body.items) ? body.items : [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const typedItem = item as { videoUrl?: unknown; colors?: unknown[] };
    if (typeof typedItem.videoUrl === "string" && typedItem.videoUrl.trim()) {
      urls.push(typedItem.videoUrl.trim());
    }
    const itemColors = Array.isArray(typedItem.colors) ? typedItem.colors : [];
    for (const color of itemColors) {
      if (!color || typeof color !== "object") continue;
      const images = Array.isArray((color as { images?: unknown }).images)
        ? (color as { images: unknown[] }).images
        : [];
      for (const image of images) {
        if (typeof image === "string" && image.trim()) urls.push(image.trim());
      }
    }
  }

  return [...new Set(urls)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function collectProductAssetUrls(product: any): string[] {
  if (!product) return [];

  const urls: string[] = [];
  if (product.videoUrl) urls.push(product.videoUrl);

  for (const image of product.images ?? []) {
    if (image.url) urls.push(image.url);
  }
  for (const color of product.colors ?? []) {
    for (const image of color.images ?? []) {
      if (image.url) urls.push(image.url);
    }
  }
  for (const item of product.items ?? []) {
    if (item.videoUrl) urls.push(item.videoUrl);
    for (const color of item.colors ?? []) {
      for (const image of color.images ?? []) {
        if (image.url) urls.push(image.url);
      }
    }
  }

  return [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
}
