import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import ProductCarousel from "@/components/shared/ProductCarousel";
import { SectionConfig, ProductItem } from "@/components/shared/ProductCarousel/types";

// --- 1. CONFIGURACIÓN PREMIUM ---
const config: SectionConfig = {
  eyebrow: "Colección Exclusiva",
  titleStart: "Favoritos de",
  titleItalic: "Casa Verde",
  linkHref: "/collections/mas-vendidos",
  linkText: "EXPLORAR SELECCIÓN",
  bgColor: "bg-[#FDFBF7]", // Fondo beige cálido y elegante en lugar de gris genérico
  decorAlign: "right",
  badgeVariant: "white",
};

const formatPrice = (price: number) =>
  `$${Math.round(price).toLocaleString("es-CO")}`;

export async function fetchFeaturedProducts(): Promise<ProductItem[]> {
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
  
  return (
    // --- 2. ENVOLTURA CON ACENTOS DE LUJO ---
    // ELIMINADO: mt-12 sm:mt-16 y pt-2 para evitar el espacio blanco.
    // AÑADIDO: bg-[#FDFBF7] al contenedor padre para que el empalme sea invisible.
    <section className="relative w-full bg-[#FDFBF7] border-t border-[#C19A6B]/15 overflow-hidden">
      
      {/* Brillo decorativo superior dorado/esmeralda */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#C19A6B]/50 to-transparent" />
      
      {/* Patrón de fondo sutil para dar textura */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
        style={{ backgroundImage: "radial-gradient(#154734 1px, transparent 1px)", backgroundSize: "40px 40px" }} 
      />

      <div className="relative z-10">
        <ProductCarousel config={config} items={items} />
      </div>
    </section>
  );
};

export default BestSellers;
