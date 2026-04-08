import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import NewCollectionClient from "./NewCollectionClient";

async function fetchNewProducts(): Promise<CollectionProduct[]> {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw as any[]).map((p) => {
    const parentStock = p.colors.reduce(
      (acc: number, c: { variants: { stock: number }[] }) =>
        acc + c.variants.reduce((s: number, v: { stock: number }) => s + v.stock, 0),
      0
    );
    // Para sets: el stock real es la suma de sus subcategorías
    const totalStock = (p.isSet && p.items?.length > 0)
      ? p.items.reduce((acc: number, item: { colors: { variants: { stock: number }[] }[] }) =>
          acc + item.colors.reduce((s: number, c) =>
            s + c.variants.reduce((vs: number, v) => vs + v.stock, 0), 0), 0)
      : parentStock;
    const parentImages: string[] = p.images.map((i: { url: string }) => i.url);
    const fallbackUrl = p.isSet && parentImages.length === 0
      ? (p.items?.[0]?.colors?.[0]?.images?.[0]?.url ?? null)
      : null;
    const cardImages = fallbackUrl ? [fallbackUrl] : parentImages;
    const itemPrices: number[] = p.isSet && p.items?.length > 0
      ? p.items.map((it: { price: unknown }) => it.price ? Number(it.price) : null).filter((v: number | null): v is number => v !== null)
      : [];
    const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : undefined;

    return {
      images: cardImages,
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      oldPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      isSet: p.isSet || false,
      minPrice,
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

const NewCollection = async () => {
  const items = await fetchNewProducts();
  return <NewCollectionClient items={items} />;
};

export default NewCollection;
