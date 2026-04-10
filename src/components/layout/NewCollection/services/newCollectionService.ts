import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import { mapRawToCollectionProduct, type RawNewProduct } from "../mappers/productMapper";

export async function fetchNewProducts(): Promise<CollectionProduct[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (prisma as any).product.findMany({
    where: { isNew: true, status: ProductStatus.ACTIVE },
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
          colors: {
            select: {
              images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
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
    take: 10,
  });

  return (raw as RawNewProduct[]).map(mapRawToCollectionProduct);
}
