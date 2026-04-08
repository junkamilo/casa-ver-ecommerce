import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { computeProductBadge } from "@/lib/productBadge";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import CollectionHero from "@/app/collections/[slug]/components/CollectionHero";
import CollectionClient from "@/app/collections/[slug]/components/CollectionClient";
import type { CollectionProduct, FilterOptions } from "@/app/collections/[slug]/types";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import BackButton from "@/components/ui/BackButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Los Más Deseados | Casa Verde",
  description: "Descubre los productos más deseados de nuestra colección.",
};

async function fetchBestSellers(): Promise<{
  products: CollectionProduct[];
  filterOptions: FilterOptions;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (prisma as any).product.findMany({
    where: { isFeatured: true, status: ProductStatus.ACTIVE },
    select: {
      name: true,
      slug: true,
      basePrice: true,
      comparePrice: true,
      isNew: true,
      isFeatured: true,
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
          colors: { take: 1, select: { images: { orderBy: { order: "asc" }, take: 1, select: { url: true } } } },
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const colorMap = new Map<string, string>();
  let maxPriceDb = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: CollectionProduct[] = (raw as any[]).map((p) => {
    const price = Number(p.basePrice);
    if (price > maxPriceDb) maxPriceDb = price;
    for (const c of p.colors) colorMap.set(c.hexCode, c.name);

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
      price,
      oldPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      isSet: p.isSet || false,
      minPrice,
      badge: computeProductBadge({
        isProductNew: p.isProductNew,
        isProductNewAt: p.isProductNewAt,
        isOnSale: p.isOnSale,
      }),
      colors:
        p.colors.length > 0
          ? p.colors.map((c: { name: string; hexCode: string; images: { url: string }[] }) => ({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null }))
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

          <BackButton className="mb-4 sm:mb-6" />

          <CollectionHero title="Los Más Deseados" />

          <div className="mt-4 sm:mt-6 lg:mt-8 w-full">
            {products.length === 0 ? (
              <SectionEmptyState message="Pronto agregaremos los productos más vendidos." />
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
