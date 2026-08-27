import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { SITE_NAME } from "@/lib/seo";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import CollectionHero from "./components/CollectionHero";
import CollectionClient from "./components/CollectionClient";
import BackButton from "@/components/ui/BackButton";
import {
  CatalogListingSearch,
  catalogSearchEmptyMessage,
} from "@/components/search";
import { getCollectionProductsUseCase } from "@/modules/collections/application/get-collection-products.use-case";
import { getCategoryBySlugUseCase } from "@/modules/collections/application/get-category-by-slug.use-case";

// ── SEO dinámico ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const category = await getCategoryBySlugUseCase(slug);

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
  searchParams: Promise<{ tipo?: string; q?: string }>;
}) {
  const { slug } = await params;
  const { tipo, q } = await searchParams;
  const { category, garmentTypeName, products, filterOptions } =
    await getCollectionProductsUseCase(slug, tipo, q);
  const title = (
    garmentTypeName ??
    category?.name ??
    slug.replace(/-/g, " ")
  ).toUpperCase();
  const scopeName = (
    garmentTypeName ??
    category?.name ??
    "esta colección"
  ).toLowerCase();

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

          <CatalogListingSearch placeholder={`Buscar en ${scopeName}...`} />

          <div className="mt-4 sm:mt-6 lg:mt-8 w-full">
            <CollectionClient
              products={products}
              filterOptions={filterOptions}
              setItemKey={tipo ?? null}
              emptyMessage={catalogSearchEmptyMessage(q)}
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
