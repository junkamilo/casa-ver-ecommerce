import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import CollectionHero from "./components/CollectionHero";
import CollectionClient from "./components/CollectionClient";
import type { CollectionProduct, FilterOptions } from "./types";

interface CollectionFilters {
  minPrice?: string;
  maxPrice?: string;
  color?: string;
}

async function getCollectionData(
  slug: string,
  filters: CollectionFilters
): Promise<{
  category: { name: string } | null;
  products: CollectionProduct[];
  filterOptions: FilterOptions;
}> {
  const empty = { category: null, products: [], filterOptions: { availableColors: [], maxPriceDb: 0 } };

  try {
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      select: { name: true },
    });

    if (!category) return empty;

    // --- Build dynamic where clause ---
    const where: Prisma.ProductWhereInput = {
      category: { slug },
      status: "ACTIVE",
    };

    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    // color param is stored without "#" in URL
    if (filters.color) {
      where.colors = { some: { hexCode: `#${filters.color}` } };
    }

    // --- Fetch sidebar option data (unfiltered, same category) ---
    const allForFilters = await prisma.product.findMany({
      where: { category: { slug }, status: "ACTIVE" },
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
      for (const c of p.colors) {
        colorMap.set(c.hexCode, c.name);
      }
    }

    const availableColors = Array.from(colorMap.entries()).map(([hexCode, name]) => ({ hexCode, name }));

    // --- Fetch filtered products ---
    const raw = await prisma.product.findMany({
      where,
      select: {
        name: true,
        slug: true,
        basePrice: true,
        comparePrice: true,
        isFeatured: true,
        isNew: true,
        images: {
          where: { colorId: null },
          orderBy: { order: "asc" },
          take: 2,
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
      mediaUrl: p.images[0]?.url ?? p.colors[0]?.images[0]?.url ?? null,
      hoverMediaUrl: p.images[1]?.url ?? p.colors[1]?.images[0]?.url ?? null,
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      oldPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      badge: p.comparePrice
        ? "Oferta"
        : p.isNew
        ? "Nuevo"
        : p.isFeatured
        ? "Destacado"
        : undefined,
      colors:
        p.colors.length > 0
          ? p.colors.map((c) => ({ name: c.name, hexCode: c.hexCode, imageUrl: c.images[0]?.url ?? null }))
          : undefined,
    }));

    return { category, products, filterOptions: { availableColors, maxPriceDb } };
  } catch {
    return empty;
  }
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CollectionFilters>;
}) {
  const { slug } = await params;
  const filters = await searchParams;
  const { category, products, filterOptions } = await getCollectionData(slug, filters);
  const title = category?.name?.toUpperCase() ?? slug.replace(/-/g, " ").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] selection:bg-[#C19A6B]/20 relative overflow-hidden">

      {/* Fondo decorativo global sutil */}
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

          {/* Título oculto para SEO */}
          <h1 className="sr-only">{title}</h1>

          {/* Hero Section */}
          <CollectionHero
            title={title}
          />

          {/* Grilla de Productos */}
          <div className="mt-12 sm:mt-16 lg:mt-24 w-full">
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
