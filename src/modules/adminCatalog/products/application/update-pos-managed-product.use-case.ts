import { z } from "zod";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductNotFoundError, ProductPosManagedConflictError } from "./product.errors";
import { parseSafeDate } from "./create-product.validation";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";

const productRepository = new PrismaProductRepository();
const webSettingsRepository = new PrismaProductWebSettingsRepository();

const optionalDate = z.string().nullish();

/** Campos que la web puede editar en un producto sincronizado desde el POS. */
export const posManagedProductSchema = z
  .object({
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isProductNew: z.boolean().optional(),
    isProductNewAt: optionalDate,
    isOnSale: z.boolean().optional(),
    isOnSaleAt: optionalDate,
    isSuggested: z.boolean().optional(),
    suggestedAt: optionalDate,
    coverImageUrl: z.string().trim().nullish(),
    metaTitle: z.string().trim().max(70, "El título SEO no puede superar 70 caracteres").nullish(),
    metaDescription: z
      .string()
      .trim()
      .max(170, "La descripción SEO no puede superar 170 caracteres")
      .nullish(),
    garmentTypes: z.array(z.string()).max(20).optional(),
  })
  .strict();

export type PosManagedProductInput = z.infer<typeof posManagedProductSchema>;

function resolveFlagDate(flag: boolean | undefined, value: string | null | undefined) {
  if (flag === undefined) return undefined;
  return flag ? (parseSafeDate(value) ?? new Date()) : null;
}

export async function updatePosManagedProductUseCase(id: string, body: Record<string, unknown>) {
  if ("active" in body || "status" in body) {
    throw new ProductPosManagedConflictError(
      "La visibilidad de este producto la controla el POS. Ocúltalo o actívalo desde allí."
    );
  }

  const parsed = posManagedProductSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ProductPosManagedConflictError(
      issue?.code === "unrecognized_keys"
        ? `Campos controlados por el POS: ${issue.keys.join(", ")}. Solo se editan SEO, portada, etiquetas y sugeridos.`
        : (issue?.message ?? "Datos inválidos")
    );
  }

  const context = await productRepository.findPosManagedContext(id);
  if (!context) throw new ProductNotFoundError("Producto no encontrado");

  const dto = parsed.data;

  if (dto.coverImageUrl && !context.imageUrls.includes(dto.coverImageUrl)) {
    throw new ProductPosManagedConflictError("La portada debe ser una de las imágenes del producto");
  }

  if (dto.garmentTypes && dto.garmentTypes.length > 0) {
    const validCount = await productRepository.countValidGarmentTypesForCategories(
      dto.garmentTypes,
      context.categoryIds
    );
    if (validCount !== dto.garmentTypes.length) {
      throw new ProductPosManagedConflictError(
        "Uno o más tipos de prenda no existen, están inactivos o no pertenecen a las categorías del producto"
      );
    }
  }

  const isOnSaleAt = resolveFlagDate(dto.isOnSale, dto.isOnSaleAt);
  const coverImageUrl = dto.coverImageUrl === undefined ? undefined : dto.coverImageUrl || null;
  const metaTitle = dto.metaTitle === undefined ? undefined : dto.metaTitle || null;
  const metaDescription = dto.metaDescription === undefined ? undefined : dto.metaDescription || null;

  // La tienda lee la capa web (product_web_settings); la copia en Neon se sigue actualizando porque el
  // admin la muestra. Destacado, nuevo con fecha, sugerido y tipos de prenda los vuelve a poner el POS.
  await webSettingsRepository.save(context.slug, {
    isNew: dto.isNew,
    isOnSale: dto.isOnSale,
    isOnSaleAt,
    coverImageUrl,
    metaTitle,
    metaDescription,
  });

  return productRepository.updatePosManagedFields(id, {
    isFeatured: dto.isFeatured,
    isNew: dto.isNew,
    isProductNew: dto.isProductNew,
    isProductNewAt: resolveFlagDate(dto.isProductNew, dto.isProductNewAt),
    isOnSale: dto.isOnSale,
    isOnSaleAt,
    isSuggested: dto.isSuggested,
    suggestedAt: resolveFlagDate(dto.isSuggested, dto.suggestedAt),
    coverImageUrl,
    metaTitle,
    metaDescription,
    garmentTypeIds: dto.garmentTypes,
  });
}
