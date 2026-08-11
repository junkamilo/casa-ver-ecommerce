import { prisma } from "@/lib/prisma";
import type { ProductCreateInputDTO } from "../contracts/product-create.dto";
import { createColorVariants, createSetItems } from "./product-relations.helpers";
import { collectProductAssetUrls } from "../application/product-assets";
import type {
  AdminProductListItemDTO,
  AdminProductListResponseDTO,
  ProductListQueryDTO,
} from "../contracts/product-list.dto";

export class PrismaProductRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async listProducts(query: ProductListQueryDTO): Promise<AdminProductListResponseDTO> {
    const skip = (query.page - 1) * query.limit;
    const totalProducts = await this.db.product.count();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] = await this.db.product.findMany({
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip,
      include: {
        categories: {
          include: {
            category: { select: { id: true, name: true } },
          },
        },
        images: { where: { colorId: null }, orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1, select: { url: true } },
        colors: { take: 1, include: { images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1, select: { url: true } } } },
        variants: { select: { stock: true } },
        items: {
          orderBy: { order: "asc" as const },
          select: {
            name: true,
            price: true,
            colors: {
              select: {
                images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1, select: { url: true } },
                variants: { select: { stock: true } },
              },
            },
          },
        },
      },
    });

    const mapped: AdminProductListItemDTO[] = products.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any): AdminProductListItemDTO => {
        const generalImg = p.images[0]?.url;
        const colorImg = p.colors[0]?.images[0]?.url;
        const setItemImg = p.items?.[0]?.colors?.[0]?.images?.[0]?.url;
        const regularStock = p.variants.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (sum: number, v: any) => sum + v.stock,
          0
        );

        const setItems = (p.isSet && p.items?.length)
          ? p.items.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (item: any) => ({
                name: item.name,
                price: item.price != null ? Number(item.price) : null,
                stock: (item.colors ?? []).reduce(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (sum: number, c: any) =>
                    sum + (c.variants ?? []).reduce(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (s: number, v: any) => s + v.stock,
                      0
                    ),
                  0
                ),
              })
            )
          : undefined;

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          categories: (p.categories ?? []).map(
            (relation: { category: { id: string; name: string } }) => relation.category
          ),
          images: generalImg
            ? [{ url: generalImg }]
            : colorImg
              ? [{ url: colorImg }]
              : setItemImg
                ? [{ url: setItemImg }]
                : [],
          videoUrl: p.videoUrl ?? null,
          price: Number(p.basePrice),
          stock: regularStock,
          active: p.status === "ACTIVE",
          isSet: p.isSet ?? false,
          setItems,
        };
      }
    );

    const totalPages = Math.ceil(totalProducts / query.limit);
    return {
      data: mapped,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalProducts,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1,
      },
    };
  }

  async findCategoriesByIds(
    categoryIds: string[]
  ): Promise<Array<{ id: string; isActive: boolean; name: string }>> {
    if (categoryIds.length === 0) return [];
    return this.db.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, isActive: true, name: true },
    });
  }

  async findCategoryById(categoryId: string) {
    return this.db.category.findUnique({
      where: { id: categoryId },
      select: { id: true, isActive: true, name: true },
    });
  }

  async countValidGarmentTypesForCategories(
    garmentTypeIds: string[],
    categoryIds: string[]
  ): Promise<number> {
    const rows = await this.db.garmentType.findMany({
      where: {
        id: { in: garmentTypeIds },
        isActive: true,
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      select: { id: true },
    });
    return rows.length;
  }

  async countValidGarmentTypesForCategory(garmentTypeIds: string[], categoryId: string): Promise<number> {
    const rows = await this.db.garmentType.findMany({
      where: {
        id: { in: garmentTypeIds },
        isActive: true,
        categories: { some: { categoryId } },
      },
      select: { id: true },
    });
    return rows.length;
  }

  async createProductWithRelations(input: {
    dto: ProductCreateInputDTO;
    slug: string;
    resolvedCategoryIds: string[];
    resolvedGarmentTypeIds: string[];
    resolvedProductNewAt: Date | null;
    resolvedOnSaleAt: Date | null;
    resolvedSuggestedAt: Date | null;
  }) {
    const {
      dto,
      slug,
      resolvedCategoryIds,
      resolvedGarmentTypeIds,
      resolvedProductNewAt,
      resolvedOnSaleAt,
      resolvedSuggestedAt,
    } = input;
    return prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txDb = tx as any;

      const product = await txDb.product.create({
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description ? dto.description.trim() : "",
          basePrice: dto.basePrice,
          comparePrice: dto.comparePrice || null,
          status: dto.status || "ACTIVE",
          isFeatured: dto.isFeatured || false,
          isNew: dto.isNew || false,
          isProductNew: dto.isProductNew || false,
          isProductNewAt: resolvedProductNewAt,
          isOnSale: dto.isOnSale || false,
          isOnSaleAt: resolvedOnSaleAt,
          isSuggested: dto.isSuggested || false,
          suggestedAt: resolvedSuggestedAt,
          videoUrl: dto.videoUrl || null,
          categories: {
            create: resolvedCategoryIds.map((categoryId) => ({ categoryId })),
          },
          garmentTypes: resolvedGarmentTypeIds.length
            ? {
                create: resolvedGarmentTypeIds.map((garmentTypeId) => ({ garmentTypeId })),
              }
            : undefined,
          isSet: dto.isSet || false,
          metaTitle: dto.name.trim().slice(0, 60),
          metaDescription: dto.description
            ? dto.description.replace(/\s+/g, " ").trim().slice(0, 160)
            : "",
        },
      });

      await createColorVariants(
        txDb,
        product.id,
        slug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dto.colors as any) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dto.sizes as any) || [],
        (dto.stock as number) ?? 0
      );

      if (dto.isSet) {
        await createSetItems(
          txDb,
          product.id,
          slug,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (dto.items as any) || []
        );
      }

      return product;
    });
  }

  async toggleProductStatus(id: string, active: boolean) {
    try {
      return await this.db.product.update({
        where: { id },
        data: { status: active ? "ACTIVE" : "INACTIVE" },
      });
    } catch {
      return null;
    }
  }

  async updateProductWithRelations(input: {
    id: string;
    dto: ProductCreateInputDTO;
    resolvedCategoryIds: string[];
    resolvedGarmentTypeIds: string[];
    resolvedProductNewAt: Date | null;
    resolvedOnSaleAt: Date | null;
    resolvedSuggestedAt: Date | null;
  }): Promise<{ product: unknown; previousAssetUrls: string[] }> {
    const {
      id,
      dto,
      resolvedCategoryIds,
      resolvedGarmentTypeIds,
      resolvedProductNewAt,
      resolvedOnSaleAt,
      resolvedSuggestedAt,
    } = input;
    return prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txDb = tx as any;
      let previousAssetUrls: string[] = [];

      const existingProduct = await txDb.product.findUnique({
        where: { id },
        select: {
          videoUrl: true,
          images: { select: { url: true } },
          colors: { select: { images: { select: { url: true } } } },
          items: {
            select: {
              videoUrl: true,
              colors: { select: { images: { select: { url: true } } } },
            },
          },
        },
      });

      if (!existingProduct) {
        return { product: null, previousAssetUrls: [] };
      }
      previousAssetUrls = collectProductAssetUrls(existingProduct);

      await txDb.stockReservation.updateMany({
        where: {
          variant: { productId: id },
          released: false,
          expiresAt: { gt: new Date() },
        },
        data: { released: true },
      });

      await txDb.productImage.deleteMany({ where: { productId: id } });
      await txDb.productColor.deleteMany({ where: { productId: id } });
      await txDb.productItem.deleteMany({ where: { productId: id } });

      const product = await txDb.product.update({
        where: { id },
        data: {
          name: dto.name.trim(),
          description: dto.description ? dto.description.trim() : "",
          basePrice: dto.basePrice != null ? dto.basePrice : undefined,
          comparePrice: dto.comparePrice != null ? dto.comparePrice : undefined,
          status: dto.status,
          isFeatured: dto.isFeatured,
          isNew: dto.isNew,
          isProductNew: dto.isProductNew ?? false,
          isProductNewAt: resolvedProductNewAt,
          isOnSale: dto.isOnSale ?? false,
          isOnSaleAt: resolvedOnSaleAt,
          isSuggested: dto.isSuggested ?? false,
          suggestedAt: resolvedSuggestedAt,
          videoUrl: dto.videoUrl !== undefined ? (dto.videoUrl || null) : undefined,
          categories: {
            deleteMany: {},
            create: resolvedCategoryIds.map((categoryId) => ({ categoryId })),
          },
          garmentTypes: {
            deleteMany: {},
            create: resolvedGarmentTypeIds.map((garmentTypeId) => ({ garmentTypeId })),
          },
          isSet: dto.isSet ?? false,
          metaTitle: dto.name.trim().slice(0, 60),
          metaDescription: dto.description
            ? dto.description.replace(/\s+/g, " ").trim().slice(0, 160)
            : "",
        },
      });

      await createColorVariants(
        txDb,
        id,
        product.slug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dto.colors as any) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dto.sizes as any) || [],
        (dto.stock as number) ?? 0
      );

      if (dto.isSet) {
        await createSetItems(
          txDb,
          id,
          product.slug,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (dto.items as any) || []
        );
      }

      return { product, previousAssetUrls };
    });
  }

  async deleteProductWithRelations(id: string): Promise<{ assetUrls: string[] } | null> {
    return prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txDb = tx as any;

      const existingProduct = await txDb.product.findUnique({
        where: { id },
        select: {
          videoUrl: true,
          images: { select: { url: true } },
          colors: { select: { images: { select: { url: true } } } },
          items: {
            select: {
              videoUrl: true,
              colors: { select: { images: { select: { url: true } } } },
            },
          },
        },
      });
      if (!existingProduct) {
        return null;
      }

      const assetUrls = collectProductAssetUrls(existingProduct);
      await txDb.stockReservation.updateMany({
        where: {
          variant: { productId: id },
          released: false,
          expiresAt: { gt: new Date() },
        },
        data: { released: true },
      });

      await txDb.productImage.deleteMany({ where: { productId: id } });
      await txDb.productColor.deleteMany({ where: { productId: id } });
      await txDb.productItem.deleteMany({ where: { productId: id } });
      await txDb.product.delete({ where: { id } });

      return { assetUrls };
    });
  }

  async findVariantById(variantId: string) {
    return this.db.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true, color: true },
    });
  }

  async updateVariantStock(variantId: string, stock: number) {
    return this.db.productVariant.update({
      where: { id: variantId },
      data: { stock },
      include: { color: true },
    });
  }

  async getProductByIdForAdmin(id: string) {
    const product = await this.db.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: { select: { id: true, name: true } },
          },
        },
        images: { orderBy: { order: "asc" } },
        colors: { include: { images: { orderBy: { order: "asc" } }, variants: true } },
        garmentTypes: {
          include: {
            garmentType: { select: { id: true, name: true } },
          },
        },
        items: {
          orderBy: { order: "asc" },
          include: {
            colors: {
              include: {
                images: { orderBy: { order: "asc" } },
                variants: true,
              },
            },
          },
        },
      },
    });

    if (!product) return null;

    const totalStock = product.colors.reduce((sum: number, c: { variants: { stock: number }[] }) =>
      sum + c.variants.reduce((s: number, v: { stock: number }) => s + v.stock, 0), 0
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSizes = [...new Set(product.colors.flatMap((c: any) => c.variants.map((v: any) => v.size)))];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: Number(product.basePrice),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      stock: totalStock,
      categoryIds: product.categories.map(
        (relation: { category: { id: string } }) => relation.category.id
      ),
      status: product.status,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isSet: product.isSet ?? false,
      isProductNew: product.isProductNew ?? false,
      isProductNewAt: product.isProductNewAt ?? null,
      isOnSale: product.isOnSale ?? false,
      isOnSaleAt: product.isOnSaleAt ?? null,
      isSuggested: product.isSuggested ?? false,
      suggestedAt: product.suggestedAt ?? null,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      videoUrl: product.videoUrl,
      garmentTypes: product.garmentTypes.map((relation: { garmentType: { id: string } }) => relation.garmentType.id),
      generalImages: product.images
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((img: any) => !img.colorId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((img: any) => img.url),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      colors: product.colors.map((c: any) => ({
        id: c.id,
        name: c.name,
        hexCode: c.hexCode,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        images: c.images.map((img: any) => img.url),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variantStocks: Object.fromEntries(c.variants.map((v: any) => [v.size, v.stock])),
      })),
      sizes: allSizes,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants: product.colors.flatMap((c: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        c.variants.map((v: any) => ({
          id: v.id,
          colorId: c.id,
          colorName: c.name,
          size: v.size,
          stock: v.stock,
        }))
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (product.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? null,
        price: item.price ? Number(item.price) : null,
        comparePrice: item.comparePrice ? Number(item.comparePrice) : null,
        videoUrl: item.videoUrl,
        order: item.order,
        stock: item.colors.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc: number, c: any) => acc + c.variants.reduce((s: number, v: any) => s + v.stock, 0), 0
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        colors: item.colors.map((c: any) => ({
          id: c.id,
          name: c.name,
          hexCode: c.hexCode,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          images: c.images.map((img: any) => img.url),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variantStocks: Object.fromEntries(c.variants.map((v: any) => [v.size, v.stock])),
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sizes: [...new Set(item.colors.flatMap((c: any) => c.variants.map((v: any) => v.size)))],
      })),
    };
  }
}
