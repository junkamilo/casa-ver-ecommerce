import { z } from "zod";
import { getProduct } from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import { mapPosProduct, normalizePosSlug } from "@/modules/posIntegration/domain/pos-mapper";
import { revalidatePosProduct } from "@/modules/posIntegration/application/revalidate-catalog";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";
import { ProductNotFoundError, ProductPosManagedConflictError } from "./product.errors";

const webSettingsRepository = new PrismaProductWebSettingsRepository();

/**
 * Lo único que la web decide sobre un producto del POS (`product_web_settings`, por slug). Nombre, precio,
 * fotos, variantes, inventario, categorías y las etiquetas Más vendidos / Producto nuevo / Sugerido / Oferta
 * se administran en el POS.
 */
export const posManagedProductSchema = z
  .object({
    isNew: z.boolean().optional(),
    isOnSale: z.boolean().optional(),
    coverImageUrl: z.string().trim().nullish(),
    metaTitle: z.string().trim().max(70, "El título SEO no puede superar 70 caracteres").nullish(),
    metaDescription: z
      .string()
      .trim()
      .max(170, "La descripción SEO no puede superar 170 caracteres")
      .nullish(),
  })
  .strict();

export type PosManagedProductInput = z.infer<typeof posManagedProductSchema>;

export async function updatePosManagedProductUseCase(slug: string, body: Record<string, unknown>) {
  const parsed = posManagedProductSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ProductPosManagedConflictError(
      issue?.code === "unrecognized_keys"
        ? `Campos que administra el POS: ${issue.keys.join(", ")}. En la web solo se editan Nueva colección, oferta manual, portada y SEO.`
        : (issue?.message ?? "Datos inválidos")
    );
  }

  const pos = await getProduct(normalizePosSlug(slug));
  if (!pos) throw new ProductNotFoundError("El POS no publica este producto");
  const mapped = mapPosProduct(pos);

  const dto = parsed.data;
  const coverImageUrl = dto.coverImageUrl === undefined ? undefined : dto.coverImageUrl || null;
  if (coverImageUrl) {
    const images = new Set([mapped.coverImageUrl, ...mapped.colors.flatMap((c) => c.images.map((img) => img.url))]);
    if (!images.has(coverImageUrl)) {
      throw new ProductPosManagedConflictError("La portada debe ser una de las fotos del producto en el POS");
    }
  }

  const current = await webSettingsRepository.findBySlug(mapped.posSlug);
  const isOnSaleAt =
    dto.isOnSale === undefined ? undefined : dto.isOnSale ? (current?.isOnSale ? current.isOnSaleAt : new Date()) : null;

  await webSettingsRepository.save(mapped.posSlug, {
    isNew: dto.isNew,
    isOnSale: dto.isOnSale,
    isOnSaleAt,
    coverImageUrl,
    metaTitle: dto.metaTitle === undefined ? undefined : dto.metaTitle || null,
    metaDescription: dto.metaDescription === undefined ? undefined : dto.metaDescription || null,
  });
  revalidatePosProduct(mapped.posSlug);
  return { slug: mapped.posSlug };
}
