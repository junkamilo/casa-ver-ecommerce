import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import {
  transformProduct,
  type CollectionRawProduct,
} from "@/app/collections/utils/fetchCollectionProducts";

export async function fetchFeaturedProducts(): Promise<CollectionProduct[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (prisma as any).product.findMany({
    where: { isFeatured: true, status: ProductStatus.ACTIVE },
    select: {
      name: true,
      slug: true,
      basePrice: true,
      comparePrice: true,
      isSet: true,
      isProductNew: true,
      isProductNewAt: true,
      isOnSale: true,
      images: {
        orderBy: { order: "asc" },
        take: 8,
        select: { url: true },
      },
      items: {
        orderBy: { order: "asc" },
        select: {
          price: true,
          comparePrice: true,
          colors: {
            select: {
              name: true,
              hexCode: true,
              images: { orderBy: { order: "asc" }, take: 8, select: { url: true } },
              variants: { select: { stock: true } },
            },
          },
        },
      },
      colors: {
        select: {
          name: true,
          hexCode: true,
          images: {
            orderBy: { order: "asc" },
            take: 1,
            select: { url: true },
          },
          variants: { select: { stock: true } },
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 12,  // ✅ MÁXIMO 12 productos featured (típicamente se muestran 8-12 en homepage)
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw as any[]).map((p) => {
    const parentStock = p.colors.reduce(
      (acc: number, c: { variants: { stock: number }[] }) =>
        acc + c.variants.reduce((s: number, v: { stock: number }) => s + v.stock, 0),
      0
    );
    const totalStock =
      p.isSet && p.items?.length > 0
        ? p.items.reduce(
            (acc: number, item: { colors: { variants: { stock: number }[] }[] }) =>
              acc +
              item.colors.reduce(
                (s: number, c) => s + c.variants.reduce((vs: number, v) => vs + v.stock, 0),
                0
              ),
            0
          )
        : parentStock;

    const base = transformProduct(p as CollectionRawProduct);
    return {
      ...base,
      badge: computeProductBadge({
        isProductNew: p.isProductNew,
        isProductNewAt: p.isProductNewAt,
        isOnSale: p.isOnSale,
        stock: totalStock,
      }),
    };
  });
}

