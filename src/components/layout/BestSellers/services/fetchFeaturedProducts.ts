import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { computeProductBadge } from "@/lib/productBadge";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

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
    const totalStock = (p.isSet && p.items?.length > 0)
      ? p.items.reduce((acc: number, item: { colors: { variants: { stock: number }[] }[] }) =>
          acc + item.colors.reduce((s: number, c) =>
            s + c.variants.reduce((vs: number, v) => vs + v.stock, 0), 0), 0)
      : parentStock;

    const parentImages: string[] = p.images.map((i: { url: string }) => i.url);
    const cardImages: string[] =
      parentImages.length > 0
        ? parentImages
        : p.isSet && (p.items?.[0]?.colors?.[0]?.images?.length ?? 0) > 0
          ? (p.items[0].colors[0].images as { url: string }[]).map((i) => i.url)
          : [];

    const itemPrices: number[] = p.isSet && p.items?.length > 0
      ? p.items.map((it: { price: unknown }) => it.price ? Number(it.price) : null).filter((v: number | null): v is number => v !== null)
      : [];
    const minPrice = itemPrices.length > 0 ? Math.min(...itemPrices) : undefined;

    // Para sets: oldPrice = comparePrice de la primera subcategoría (si existe)
    const oldPrice = p.isSet
      ? (p.items?.[0]?.comparePrice ? Number(p.items[0].comparePrice) : undefined)
      : (p.comparePrice ? Number(p.comparePrice) : undefined);

    // Para sets: si el padre no tiene colores, usar los de la primera subcategoría
    type ItemColor = { name: string; hexCode: string; images: { url: string }[] };
    const parentColors = p.colors.length > 0
      ? p.colors.map((c: ItemColor) => ({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null }))
      : undefined;
    const firstItemColors = p.isSet && !parentColors && p.items?.[0]?.colors?.length > 0
      ? p.items[0].colors.map((c: ItemColor) => ({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null }))
      : undefined;

    return {
      images: cardImages,
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      oldPrice,
      isSet: p.isSet || false,
      minPrice,
      badge: computeProductBadge({
        isProductNew: p.isProductNew,
        isProductNewAt: p.isProductNewAt,
        isOnSale: p.isOnSale,
        stock: totalStock,
      }),
      colors: parentColors ?? firstItemColors,
    };
  });
}
