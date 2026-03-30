import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { ProductItem } from "@/components/shared/ProductCarousel/types";
import { computeProductBadge } from "@/lib/productBadge";
import BestSellersClient from "./BestSellersClient";

const formatPrice = (price: number) =>
  `$${Math.round(price).toLocaleString("es-CO")}`;

async function fetchFeaturedProducts(): Promise<ProductItem[]> {
  const raw = await prisma.product.findMany({
    where: { isFeatured: true, status: ProductStatus.ACTIVE },
    include: {
      colors: {
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          variants: { select: { stock: true } },
        },
        orderBy: { id: "asc" },
      },
      images: {
        where: { colorId: null },
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw as any[]).map((p) => {
    const firstColorImage = p.colors[0]?.images[0]?.url ?? null;
    const firstGeneralImage = p.images[0]?.url ?? null;
    const image = firstColorImage ?? firstGeneralImage ?? "/placeholder.jpg";

    const totalStock = p.colors.reduce(
      (acc: number, c: { variants: { stock: number }[] }) =>
        acc + c.variants.reduce((s: number, v: { stock: number }) => s + v.stock, 0),
      0
    );

    return {
      image,
      name: p.name,
      slug: p.slug,
      price: formatPrice(Number(p.basePrice)),
      oldPrice: p.comparePrice ? formatPrice(Number(p.comparePrice)) : undefined,
      colors: p.colors.map((c: { hexCode: string }) => c.hexCode),
      colorLabel: p.colors[0]?.name,
      badge: computeProductBadge({
        isProductNew: p.isProductNew,
        isProductNewAt: p.isProductNewAt,
        isOnSale: p.isOnSale,
        stock: totalStock,
      }),
    };
  });
}

const BestSellers = async () => {
  const items = await fetchFeaturedProducts();
  return <BestSellersClient items={items} />;
};

export default BestSellers;
