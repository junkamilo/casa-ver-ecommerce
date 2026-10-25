import { isPosMediaUrl } from "@/lib/image-hosts";
import type { MappedPosProduct } from "@/modules/posIntegration/domain/pos-mapper";
import type { RawColor, RawProductDetail } from "./product-detail.entity";

/** Lo que la web decide sobre un producto del POS (`product_web_settings`). */
export interface ProductWebOverlay {
  metaTitle: string | null;
  metaDescription: string | null;
  coverImageUrl: string | null;
  videoUrl: string | null;
  isOnSale: boolean;
  isOnSaleAt: Date | null;
}

/**
 * Portada: la elegida en la web si sigue siendo válida (una foto propia de la web, o una foto del POS que
 * el producto aún tiene); si no, la del POS.
 */
export function resolveWebCover(mapped: MappedPosProduct, overlay: ProductWebOverlay | null): string | null {
  const chosen = overlay?.coverImageUrl?.trim();
  if (chosen) {
    const productImages = mapped.colors.flatMap((c) => c.images.map((img) => img.url));
    if (!isPosMediaUrl(chosen) || chosen === mapped.coverImageUrl || productImages.includes(chosen)) return chosen;
  }
  return mapped.coverImageUrl;
}

/** Video: el puesto en la web o el del POS. */
export function resolveWebVideo(mapped: MappedPosProduct, overlay: ProductWebOverlay | null): string | null {
  return overlay?.videoUrl?.trim() || mapped.videoUrl;
}

/** Oferta: la etiqueta ON_SALE del POS manda; sin ella vale la oferta manual de la web. */
export function resolveWebOnSale(mapped: MappedPosProduct, overlay: ProductWebOverlay | null): boolean {
  return mapped.labels.isOnSale || Boolean(overlay?.isOnSale);
}

/**
 * Producto del POS en la forma que consumen los mappers del PDP. Identidad: `id` = slug y cada variante
 * con `id` = SKU del POS (`pos-<slug>-<colorId>-<sizeId>`), que es lo que el carrito y el checkout usan.
 */
export function posToRawProductDetail(
  mapped: MappedPosProduct,
  overlay: ProductWebOverlay | null,
): RawProductDetail {
  const colors: RawColor[] = mapped.colors.map((color, index) => ({
    id: `${mapped.posSlug}-color-${index}`,
    name: color.name,
    hexCode: color.hexCode,
    images: color.images.map((img) => ({ url: img.url, altText: img.altText })),
    variants: color.variants.map((v) => ({ id: v.sku, sku: v.sku, size: v.size, stock: v.stock })),
  }));

  return {
    id: mapped.posSlug,
    name: mapped.name,
    slug: mapped.posSlug,
    description: mapped.description,
    basePrice: mapped.basePrice,
    comparePrice: mapped.comparePrice,
    videoUrl: resolveWebVideo(mapped, overlay),
    coverImageUrl: resolveWebCover(mapped, overlay),
    isSet: false,
    isProductNew: mapped.labels.isProductNew,
    isProductNewAt: mapped.labels.isProductNewAt,
    isOnSale: resolveWebOnSale(mapped, overlay),
    // Las fotos del POS son por color; la galería general es la portada.
    images: [],
    colors,
    items: [],
  };
}

/** SEO de un producto del POS: lo puesto en la web o, por defecto, nombre y descripción del POS. */
export function posProductSeo(mapped: MappedPosProduct, overlay: ProductWebOverlay | null) {
  const cover = resolveWebCover(mapped, overlay);
  return {
    name: mapped.name,
    description: mapped.description,
    metaTitle: overlay?.metaTitle ?? mapped.name.slice(0, 60),
    metaDescription: overlay?.metaDescription ?? mapped.description.replace(/\s+/g, " ").trim().slice(0, 160),
    firstImageUrl: cover ?? mapped.colors[0]?.images[0]?.url ?? null,
  };
}
