import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { ProductItem } from "@/components/shared/ProductCarousel/types";
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

  return raw.map((p) => {
    const firstColorImage = p.colors[0]?.images[0]?.url ?? null;
    const firstGeneralImage = p.images[0]?.url ?? null;
    const image = firstColorImage ?? firstGeneralImage ?? "/placeholder.jpg";

    const totalStock = p.colors.reduce(
      (acc: number, c) =>
        acc + c.variants.reduce((s: number, v) => s + v.stock, 0),
      0
    );

    return {
      image,
      name: p.name,
      slug: p.slug,
      price: formatPrice(Number(p.basePrice)),
      oldPrice: p.comparePrice ? formatPrice(Number(p.comparePrice)) : undefined,
      colors: p.colors.map((c) => c.hexCode),
      colorLabel: p.colors[0]?.name,
      badge: totalStock === 0 ? "Agotado" : undefined,
    };
  });
}

const BestSellers = async () => {
  const items = await fetchFeaturedProducts();
  return <BestSellersClient items={items} />;
};

export default BestSellers;
