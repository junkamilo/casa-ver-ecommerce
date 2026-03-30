import { prisma } from "@/lib/prisma";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import CollectionHero from "@/app/collections/[slug]/components/CollectionHero";
import CollectionClient from "@/components/shared/ProductCollection/CollectionClient";
import { computeProductBadge } from "@/lib/productBadge";
import BackButton from "@/components/ui/BackButton";
import type { CollectionProduct, FilterOptions } from "@/components/shared/ProductCollection/types";

interface TiendaFilters {
  minPrice?: string;
  maxPrice?: string;
  color?: string;
}

async function getAllProducts(filters: TiendaFilters): Promise<{
  products: CollectionProduct[];
  filterOptions: FilterOptions;
}> {
  try {
    const where: Record<string, unknown> = { status: "ACTIVE" };

    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    if (filters.color) {
      where.colors = { some: { hexCode: `#${filters.color}` } };
    }

    // Datos para los filtros (sin filtros aplicados, para mostrar opciones completas)
    const allForFilters = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        basePrice: true,
        colors: { select: { name: true, hexCode: true } },
      },
    });

    const colorMap = new Map<string, string>();
    let maxPriceDb = 0;
    for (const p of allForFilters) {
      const price = Number(p.basePrice);
      if (price > maxPriceDb) maxPriceDb = price;
      for (const c of p.colors) colorMap.set(c.hexCode, c.name);
    }

    const availableColors = Array.from(colorMap.entries()).map(([hexCode, name]) => ({ hexCode, name }));

    // Productos filtrados
    const raw = await prisma.product.findMany({
      where,
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products: CollectionProduct[] = raw.map((p) => ({
      images: p.images.map((i) => i.url),
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      oldPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      badge: computeProductBadge({
        isProductNew: p.isProductNew,
        isProductNewAt: p.isProductNewAt,
        isOnSale: p.isOnSale,
      }),
      colors:
        p.colors.length > 0
          ? p.colors.map((c) => ({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null }))
          : undefined,
    }));

    return { products, filterOptions: { availableColors, maxPriceDb } };
  } catch {
    return { products: [], filterOptions: { availableColors: [], maxPriceDb: 0 } };
  }
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tienda | Casa Verde",
  description: "Descubre toda la colección de Casa Verde.",
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<TiendaFilters>;
}) {
  const filters = await searchParams;
  const { products, filterOptions } = await getAllProducts(filters);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] selection:bg-[#C19A6B]/20 relative overflow-hidden">

      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#154734 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-20">
        <AnnouncementBar />
        <Header />
      </div>

      <main className="flex-1 w-full flex flex-col pt-6 pb-24 sm:pt-10 sm:pb-32 relative z-10">
        <div className="w-full max-w-400 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">

          <h1 className="sr-only">Tienda — Casa Verde</h1>

          <BackButton className="mb-4 sm:mb-6" />

          <CollectionHero title="TIENDA" />

          <div className="mt-6 sm:mt-8 lg:mt-10 w-full">
            <CollectionClient products={products} filterOptions={filterOptions} />
          </div>

        </div>
      </main>

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
