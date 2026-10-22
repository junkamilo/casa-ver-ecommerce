import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isPosMediaUrl } from "@/lib/image-hosts";
import { normalizePosSlug, type MappedPosCategory, type MappedPosProduct } from "../domain/pos-mapper";

type Tx = Prisma.TransactionClient;

const TX_OPTIONS = { timeout: 30_000, maxWait: 10_000 };

export class PosSyncConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PosSyncConflictError";
  }
}

export class PrismaPosSyncRepository {
  // ── Categorías del POS (espejo local, enlazado por posWebId) ──────────────

  /** Categorías activas de la web enlazadas a esos webIds del POS: webId → id. */
  async findCategoryIdsByPosWebIds(webIds: string[]): Promise<Map<string, string>> {
    if (webIds.length === 0) return new Map();
    const rows = await prisma.category.findMany({
      where: { posWebId: { in: webIds }, isActive: true },
      select: { id: true, posWebId: true },
    });
    return new Map(rows.map((r) => [r.posWebId as string, r.id]));
  }

  /**
   * Crea o actualiza la categoría espejo de una categoría/subcategoría del POS. Se enlaza por posWebId;
   * si aún no existe y en la web hay una categoría propia con el mismo slug, se adopta (conserva su
   * contenido). El slug se ajusta si otra categoría ya lo usa.
   */
  async upsertPosCategory(category: MappedPosCategory, parentId: string | null): Promise<string> {
    const linked = await prisma.category.findUnique({ where: { posWebId: category.posWebId } });
    if (linked) {
      const slug = linked.slug === category.slug ? linked.slug : await this.freeCategorySlug(category.slug, linked.id);
      const updated = await prisma.category.update({
        where: { id: linked.id },
        data: {
          name: category.name,
          slug,
          description: category.description,
          image: category.imageUrl ?? linked.image,
          metaTitle: category.metaTitle,
          metaDescription: category.metaDescription,
          order: category.order,
          parentId,
          isActive: true,
        },
        select: { id: true },
      });
      return updated.id;
    }

    const sameSlug = await prisma.category.findUnique({ where: { slug: category.slug } });
    if (sameSlug && !sameSlug.posWebId) {
      const adopted = await prisma.category.update({
        where: { id: sameSlug.id },
        data: { posWebId: category.posWebId, isActive: true },
        select: { id: true },
      });
      return adopted.id;
    }

    const created = await prisma.category.create({
      data: {
        posWebId: category.posWebId,
        name: category.name,
        slug: await this.freeCategorySlug(category.slug, null),
        description: category.description,
        image: category.imageUrl,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
        order: category.order,
        parentId,
        isActive: true,
      },
      select: { id: true },
    });
    return created.id;
  }

  /** Oculta las categorías espejo cuyo webId ya no publica el POS. */
  async deactivatePosCategoriesExcept(webIds: string[]): Promise<number> {
    const result = await prisma.category.updateMany({
      where: { posWebId: { not: null, notIn: webIds }, isActive: true },
      data: { isActive: false },
    });
    return result.count;
  }

  private async freeCategorySlug(base: string, ownId: string | null): Promise<string> {
    let candidate = base;
    for (let n = 2; ; n++) {
      const taken = await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } });
      if (!taken || taken.id === ownId) return candidate;
      candidate = `${base}-${n}`;
    }
  }

  // ── Tipos de prenda ────────────────────────────────────────────────────────

  /** Crea los tipos de prenda del POS que la web aún no tiene (no renombra los existentes). */
  async ensureGarmentTypes(types: { slug: string; name: string; order: number }[]): Promise<void> {
    for (const type of types) {
      await prisma.garmentType.upsert({
        where: { slug: type.slug },
        update: {},
        create: { slug: type.slug, name: type.name, order: type.order, isActive: true },
      });
    }
  }

  async findGarmentTypeIdsBySlugs(slugs: string[]): Promise<string[]> {
    if (slugs.length === 0) return [];
    const rows = await prisma.garmentType.findMany({ where: { slug: { in: slugs } }, select: { id: true } });
    return rows.map((r) => r.id);
  }

  // ── Productos ──────────────────────────────────────────────────────────────

  async upsertProduct(
    mapped: MappedPosProduct,
    categoryIds: string[],
    garmentTypeIds: string[] = [],
  ): Promise<{ productId: string; slug: string; created: boolean }> {
    return prisma.$transaction(async (tx) => {
      // Sin distinguir mayúsculas: antes el POS publicaba el slug en mayúsculas.
      const byPosSlug = await tx.product.findFirst({
        where: { posSlug: { equals: mapped.posSlug, mode: "insensitive" } },
      });
      const bySlug = byPosSlug
        ? null
        : await tx.product.findFirst({ where: { slug: { equals: mapped.posSlug, mode: "insensitive" } } });

      if (bySlug && bySlug.posSlug && bySlug.posSlug.toLowerCase() !== mapped.posSlug) {
        throw new PosSyncConflictError(
          `El slug "${mapped.posSlug}" ya lo usa otro producto del POS (${bySlug.posSlug})`,
        );
      }

      const existing = byPosSlug ?? bySlug;

      const posFields = {
        posSlug: mapped.posSlug,
        posSyncedAt: new Date(),
        slug: mapped.posSlug,
        name: mapped.name,
        description: mapped.description,
        basePrice: mapped.basePrice,
        comparePrice: mapped.comparePrice,
        status: "ACTIVE" as const,
        // Etiquetas de vitrina: las administra el POS para sus productos.
        isFeatured: mapped.labels.isFeatured,
        isProductNew: mapped.labels.isProductNew,
        isProductNewAt: mapped.labels.isProductNewAt,
        isSuggested: mapped.labels.isSuggested,
        suggestedAt: mapped.labels.suggestedAt,
      };

      // Portada y video: se conserva lo que la web haya puesto a mano; lo que vino del POS se actualiza.
      const keepOrPos = (current: string | null, fromPos: string | null) =>
        current && !isPosMediaUrl(current) ? current : fromPos;

      // Oferta (etiqueta ON_SALE): si el POS la envía, manda el POS. Si no la envía, solo se quita la que
      // puso el POS; la oferta marcada a mano en la web se respeta (migración gradual al POS).
      const onSaleFields = mapped.labels.isOnSale
        ? { isOnSale: true, isOnSaleAt: mapped.labels.isOnSaleAt, onSaleFromPos: true }
        : existing?.onSaleFromPos
          ? { isOnSale: false, isOnSaleAt: null, onSaleFromPos: false }
          : {};

      const product = existing
        ? await tx.product.update({
            where: { id: existing.id },
            data: {
              ...posFields,
              ...onSaleFields,
              videoUrl: keepOrPos(existing.videoUrl, mapped.videoUrl),
              coverImageUrl: keepOrPos(existing.coverImageUrl, mapped.coverImageUrl),
            },
            select: { id: true, slug: true },
          })
        : await tx.product.create({
            data: {
              ...posFields,
              ...onSaleFields,
              videoUrl: mapped.videoUrl,
              coverImageUrl: mapped.coverImageUrl,
              metaTitle: mapped.name.slice(0, 60),
              metaDescription: mapped.description.replace(/\s+/g, " ").trim().slice(0, 160),
            },
            select: { id: true, slug: true },
          });

      await tx.productCategory.deleteMany({
        where: { productId: product.id, categoryId: { notIn: categoryIds } },
      });
      if (categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({ productId: product.id, categoryId })),
          skipDuplicates: true,
        });
      }

      await tx.productGarmentType.deleteMany({
        where: { productId: product.id, garmentTypeId: { notIn: garmentTypeIds } },
      });
      if (garmentTypeIds.length > 0) {
        await tx.productGarmentType.createMany({
          data: garmentTypeIds.map((garmentTypeId) => ({ productId: product.id, garmentTypeId })),
          skipDuplicates: true,
        });
      }

      await this.syncColorsAndVariants(tx, product.id, mapped);

      return { productId: product.id, slug: product.slug, created: !existing };
    }, TX_OPTIONS);
  }

  private async syncColorsAndVariants(tx: Tx, productId: string, mapped: MappedPosProduct) {
    const keepNames = mapped.colors.map((c) => c.name);

    const staleColors = await tx.productColor.findMany({
      where: { productId, name: { notIn: keepNames } },
      select: { id: true },
    });
    if (staleColors.length > 0) {
      const staleIds = staleColors.map((c) => c.id);
      await tx.productImage.deleteMany({ where: { colorId: { in: staleIds } } });
      await tx.productColor.deleteMany({ where: { id: { in: staleIds } } });
    }
    await tx.productImage.deleteMany({ where: { productId, colorId: null } });

    const keptVariantIds: string[] = [];

    for (const color of mapped.colors) {
      const savedColor = await tx.productColor.upsert({
        where: { productId_name: { productId, name: color.name } },
        update: { hexCode: color.hexCode },
        create: { productId, name: color.name, hexCode: color.hexCode },
        select: { id: true },
      });

      await tx.productImage.deleteMany({ where: { colorId: savedColor.id } });
      if (color.images.length > 0) {
        await tx.productImage.createMany({
          data: color.images.map((img) => ({
            productId,
            colorId: savedColor.id,
            url: img.url,
            altText: color.name,
            order: img.order,
            isCover: img.isCover,
          })),
        });
      }

      for (const variant of color.variants) {
        const availability = {
          posAvailable: variant.posAvailable,
          posLowStock: variant.posLowStock,
          stock: variant.stock,
          isActive: true,
        };
        const existing = await tx.productVariant.findUnique({
          where: { productId_colorId_size: { productId, colorId: savedColor.id, size: variant.size } },
          select: { id: true },
        });
        const saved = existing
          ? await tx.productVariant.update({ where: { id: existing.id }, data: availability, select: { id: true } })
          : await tx.productVariant.create({
              data: {
                productId,
                colorId: savedColor.id,
                size: variant.size,
                sku: variant.sku,
                minStock: 2,
                ...availability,
              },
              select: { id: true },
            });
        keptVariantIds.push(saved.id);
      }
    }

    await tx.productVariant.updateMany({
      where: { productId, id: { notIn: keptVariantIds } },
      data: { isActive: false, posAvailable: false, posLowStock: false, stock: 0 },
    });
  }

  async hideProductByPosSlug(posSlug: string): Promise<{ slug: string } | null> {
    const product = await prisma.product.findFirst({
      where: { posSlug: { equals: posSlug, mode: "insensitive" } },
      select: { id: true, slug: true },
    });
    if (!product) return null;
    await prisma.product.update({ where: { id: product.id }, data: { status: "INACTIVE" } });
    return { slug: product.slug };
  }

  async listActivePosProductSlugs(): Promise<string[]> {
    const rows = await prisma.product.findMany({
      where: { posSlug: { not: null }, status: "ACTIVE" },
      select: { posSlug: true },
    });
    return rows.map((r) => r.posSlug as string);
  }

  async hideProductsByPosSlugs(posSlugs: string[]): Promise<number> {
    if (posSlugs.length === 0) return 0;
    const result = await prisma.product.updateMany({
      where: { posSlug: { in: posSlugs }, status: "ACTIVE" },
      data: { status: "INACTIVE" },
    });
    return result.count;
  }

  async findPosSlugsByProductIds(productIds: string[]): Promise<Map<string, string>> {
    if (productIds.length === 0) return new Map();
    const rows = await prisma.product.findMany({
      where: { id: { in: productIds }, posSlug: { not: null } },
      select: { id: true, posSlug: true },
    });
    return new Map(rows.map((r) => [r.id, r.posSlug as string]));
  }

  /** Producto de Neon (id) de cada slug del POS que aún tiene espejo. */
  async findProductIdsByPosSlugs(slugs: string[]): Promise<Map<string, string>> {
    if (slugs.length === 0) return new Map();
    const rows = await prisma.product.findMany({
      // Sin distinguir mayúsculas: los guardados antes iban en mayúsculas.
      where: { posSlug: { in: slugs, mode: "insensitive" } },
      select: { id: true, posSlug: true },
    });
    return new Map(rows.map((r) => [normalizePosSlug(r.posSlug as string), r.id]));
  }

  async findVariantsForAvailabilityCheck(variantIds: string[]) {
    if (variantIds.length === 0) return [];
    return prisma.productVariant.findMany({
      where: { id: { in: variantIds }, product: { posSlug: { not: null } } },
      select: {
        id: true,
        sku: true,
        size: true,
        color: { select: { name: true } },
        product: { select: { posSlug: true } },
      },
    });
  }
}
