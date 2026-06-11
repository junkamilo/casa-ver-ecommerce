import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { SITE_NAME } from "@/lib/seo";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import CollectionHero from "./components/CollectionHero";
import CollectionClient from "./components/CollectionClient";
import BackButton from "@/components/ui/BackButton";
import type { CollectionProduct, FilterOptions } from "./types";
import {
  COLLECTION_PRODUCT_GRID_SELECT,
  transformProduct,
  type CollectionRawProduct,
} from "../utils/fetchCollectionProducts";

const PRODUCT_SELECT = {
  ...COLLECTION_PRODUCT_GRID_SELECT,
  isFeatured: true,
  isNew: true,
};

// ── Data fetcher ──────────────────────────────────────────────────────────────
async function getCollectionData(
  slug: string,
  tipoSlug?: string,
): Promise<{
  category: { name: string } | null;
  garmentTypeName?: string;
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

    // Si viene ?tipo=slug, buscamos el id y nombre del garmentType para filtrar
    let garmentTypeId: string | undefined;
    let garmentTypeName: string | undefined;
    if (tipoSlug) {
      const gt = await prisma.garmentType.findUnique({
        where: { slug: tipoSlug },
        select: { id: true, name: true },
      });
      garmentTypeId = gt?.id;
      garmentTypeName = gt?.name;
    }

    const where: Prisma.ProductWhereInput = {
      category: { slug },
      status: "ACTIVE",
      ...(garmentTypeId
        ? {
            garmentTypes: {
              some: { garmentTypeId },
            },
          }
        : {}),
    };

    // Fetch all active products (filtering happens client-side)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await (prisma as any).product.findMany({
      where,
      select: PRODUCT_SELECT,
      orderBy: { createdAt: "desc" },
    });

    // Build filterOptions from the full product set
    const colorMap = new Map<string, string>();
    let maxPriceDb = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const p of raw as any[]) {
      const price = Number(p.basePrice);
      if (price > maxPriceDb) maxPriceDb = price;
      for (const c of p.colors) {
        colorMap.set(c.hexCode, c.name);
      }
    }

    const availableColors = Array.from(colorMap.entries()).map(([hexCode, name]) => ({ hexCode, name }));

    const products = (raw as CollectionRawProduct[]).map(transformProduct);

    return { category, garmentTypeName, products, filterOptions: { availableColors, maxPriceDb } };
  } catch {
    return empty;
  }
}

// ── SEO dinámico ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    select: {
      name: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      image: true,
    },
  });

  if (!category) return { title: "Colección no encontrada" };

  const title = category.metaTitle ?? category.name;
  const description =
    category.metaDescription ??
    category.description ??
    `Explora la colección ${category.name} de ${SITE_NAME}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      ...(category.image && {
        images: [{ url: category.image, alt: title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(category.image && { images: [category.image] }),
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { slug } = await params;
  const { tipo } = await searchParams;
  const { category, garmentTypeName, products, filterOptions } = await getCollectionData(slug, tipo);
  const title = (garmentTypeName ?? category?.name ?? slug.replace(/-/g, " ")).toUpperCase();

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
        <div className="w-full max-w-400 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">

          <h1 className="sr-only">{title}</h1>

          <BackButton className="mb-4 sm:mb-6" />

          <CollectionHero title={title} />

          <div className="mt-4 sm:mt-6 lg:mt-8 w-full">
            <CollectionClient
              products={products}
              filterOptions={filterOptions}
              setItemKey={tipo ?? null}
            />
          </div>

        </div>
      </main>

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
