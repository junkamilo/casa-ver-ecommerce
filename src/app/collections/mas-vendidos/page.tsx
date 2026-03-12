import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import CollectionHero from "@/app/collections/[slug]/components/CollectionHero";
import CollectionClient from "@/app/collections/[slug]/components/CollectionClient";
import type { CollectionProduct, FilterOptions } from "@/app/collections/[slug]/types";

export const metadata = {
  title: "Los Más Deseados | Casa Verde",
  description: "Descubre los productos más deseados de nuestra colección.",
};

async function fetchBestSellers(): Promise<{
  products: CollectionProduct[];
  filterOptions: FilterOptions;
}> {
  const raw = await prisma.product.findMany({
    where: { isFeatured: true, status: ProductStatus.ACTIVE },
    select: {
      name: true,
      slug: true,
      basePrice: true,
      comparePrice: true,
      isNew: true,
      isFeatured: true,
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const colorMap = new Map<string, string>();
  let maxPriceDb = 0;

  const products: CollectionProduct[] = raw.map((p) => {
    const price = Number(p.basePrice);
    if (price > maxPriceDb) maxPriceDb = price;
    for (const c of p.colors) colorMap.set(c.hexCode, c.name);

    return {
      images: p.images.map((i) => i.url),
      name: p.name,
      slug: p.slug,
      price,
      oldPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      badge: p.comparePrice ? "Oferta" : p.isNew ? "Nuevo" : undefined,
      colors:
        p.colors.length > 0
          ? p.colors.map((c) => ({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null }))
          : undefined,
    };
  });

  const availableColors = Array.from(colorMap.entries()).map(([hexCode, name]) => ({ hexCode, name }));

  return { products, filterOptions: { availableColors, maxPriceDb } };
}

export default async function MasVendidosPage() {
  const { products, filterOptions } = await fetchBestSellers();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] selection:bg-[#C19A6B]/20 relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{ backgroundImage: "radial-gradient(#154734 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="relative z-20">
        <AnnouncementBar />
        <Header />
      </div>

      <main className="flex-1 w-full flex flex-col pt-6 pb-24 sm:pt-10 sm:pb-32 relative z-10">
        <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <h1 className="sr-only">Los Más Deseados</h1>

          <CollectionHero title="Los Más Deseados" />

          <div className="mt-12 sm:mt-16 lg:mt-24 w-full">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <span
                  className="text-5xl font-light text-[#154734]/20 select-none"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  ✦
                </span>
                <p
                  className="text-center text-[#154734]/50 text-sm tracking-widest uppercase max-w-sm"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Pronto descubriremos cuáles son los favoritos de esta temporada.
                </p>
              </div>
            ) : (
              <CollectionClient products={products} filterOptions={filterOptions} />
            )}
          </div>
        </div>
      </main>

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
