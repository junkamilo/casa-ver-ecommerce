import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import BestSellersClient from "./BestSellersClient";

async function fetchFeaturedProducts(): Promise<CollectionProduct[]> {
  const raw = await prisma.product.findMany({
    where: { isFeatured: true, status: ProductStatus.ACTIVE },
    select: {
      name: true,
      slug: true,
      basePrice: true,
      comparePrice: true,
      isProductNew: true,
      isProductNewAt: true,
      isOnSale: true,
      images: {
        orderBy: { order: "asc" },
        take: 8,
        select: { url: true },
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
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw as any[]).map((p) => {
    const totalStock = p.colors.reduce(
      (acc: number, c: { variants: { stock: number }[] }) =>
        acc + c.variants.reduce((s: number, v: { stock: number }) => s + v.stock, 0),
      0
    );

    return {
      images: p.images.map((i: { url: string }) => i.url),
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      oldPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      badge: computeProductBadge({
        isProductNew: p.isProductNew,
        isProductNewAt: p.isProductNewAt,
        isOnSale: p.isOnSale,
        stock: totalStock,
      }),
      colors:
        p.colors.length > 0
          ? p.colors.map((c: { name: string; hexCode: string; images: { url: string }[] }) => ({
              name: c.name,
              hexCode: c.hexCode,
              imageUrl: c.images[0]?.url ?? null,
            }))
          : undefined,
    };
  });
}

const BestSellers = async () => {
  const items = await fetchFeaturedProducts();
  return <BestSellersClient items={items} />;
};

export default BestSellers;
