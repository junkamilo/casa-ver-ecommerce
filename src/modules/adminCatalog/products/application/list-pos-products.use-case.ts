import { isPosCatalogConfigured, listProducts } from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import { getPosTaxonomy } from "@/modules/posIntegration/application/get-pos-taxonomy.use-case";
import { mapPosLabels, normalizePosSlug } from "@/modules/posIntegration/domain/pos-mapper";
import { posToCatalogEntry } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";
import type { PosProduct } from "@/modules/posIntegration/contracts/pos-catalog.schema";
import type { AdminPosProductDTO, AdminPosProductListDTO } from "../contracts/admin-pos-product.dto";

const webSettings = new PrismaProductWebSettingsRepository();

function variantsOf(pos: PosProduct): AdminPosProductDTO["variants"] {
  const colorName = new Map(pos.colors.map((c) => [c.colorId, c.name]));
  const sizeName = new Map(pos.sizes.map((s) => [s.sizeId, s.name]));
  return pos.variants.map((v) => ({
    colorName: colorName.get(v.colorId) ?? "—",
    size: sizeName.get(v.sizeId) ?? "—",
    available: v.available,
    lowStock: v.lowStock,
  }));
}

/**
 * Productos que el POS publica en la tienda (en vivo, sin caché) con la capa web de cada uno. Más nuevo
 * primero, como la tienda. Lanza si el POS no responde.
 */
export async function listPosProductsUseCase(): Promise<AdminPosProductListDTO> {
  if (!isPosCatalogConfigured()) return { products: [], categories: [] };

  const [posProducts, settings, taxonomy] = await Promise.all([
    listProducts(),
    webSettings.findAll(),
    getPosTaxonomy(),
  ]);

  const products = posProducts.map((pos): AdminPosProductDTO => {
    const web = settings.get(normalizePosSlug(pos.slug)) ?? null;
    const entry = posToCatalogEntry(pos, web, taxonomy);
    const labels = mapPosLabels(pos.labels);
    const variants = variantsOf(pos);
    return {
      slug: entry.slug,
      name: pos.name,
      salePrice: pos.salePrice,
      displayPrice: pos.displayPrice,
      coverImageUrl: entry.card.coverImageUrl ?? null,
      categoryNames: entry.search.categoryNames,
      available: pos.available,
      lowStockCount: variants.filter((v) => v.available && v.lowStock).length,
      outOfStockCount: variants.filter((v) => !v.available).length,
      labels: {
        bestSeller: labels.isFeatured,
        productNew: labels.isProductNew,
        suggested: labels.isSuggested,
        onSale: labels.isOnSale,
      },
      components: pos.components.map((c) => c.name),
      colors: pos.colors.map((c) => ({
        name: c.name,
        hexCode: c.hexCode ?? "#cccccc",
        images: c.media.map((m) => m.url),
      })),
      variants,
      web: {
        isNew: web?.isNew ?? false,
        isOnSale: web?.isOnSale ?? false,
        isOnSaleAt: web?.isOnSaleAt?.toISOString() ?? null,
        coverImageUrl: web?.coverImageUrl ?? null,
        metaTitle: web?.metaTitle ?? null,
        metaDescription: web?.metaDescription ?? null,
      },
      publishedAt: entry.publishedAt.toISOString(),
    };
  });

  products.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const categories = [...new Set(products.flatMap((p) => p.categoryNames))].sort((a, b) => a.localeCompare(b, "es"));
  return { products, categories };
}
