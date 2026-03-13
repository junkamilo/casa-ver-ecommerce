import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import ProductCarousel from "@/components/shared/ProductCarousel";
import { SectionConfig, ProductItem } from "@/components/shared/ProductCarousel/types";

const config: SectionConfig = {
  titleStart: "Nuevos",
  titleItalic: "Ingresos",
  linkHref: "/collections/nueva-coleccion",
  linkText: "VER TODO",
  bgColor: "bg-white",
  decorAlign: "left",
  badgeVariant: "gold",
};

const formatPrice = (price: number) =>
  `$${Math.round(price).toLocaleString("es-CO")}`;

async function fetchNewProducts(): Promise<ProductItem[]> {
  const raw = await prisma.product.findMany({
    where: { isNew: true, status: ProductStatus.ACTIVE },
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
    take: 10,
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

const NewCollection = async () => {
  const items = await fetchNewProducts();
  return <ProductCarousel config={config} items={items} />;
};

export default NewCollection;