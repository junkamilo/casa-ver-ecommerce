import { prisma } from "@/lib/prisma";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import CollectionHero from "@/app/collections/[slug]/components/CollectionHero";

import type { CollectionProduct } from "@/app/collections/[slug]/types";
import { ProductGrid } from "../collections/[slug]/components/ProductGrid";

async function getAllProducts(): Promise<CollectionProduct[]> {
  try {
    const raw = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        name: true,
        slug: true,
        basePrice: true,
        comparePrice: true,
        isFeatured: true,
        isNew: true,
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

    return raw.map((p) => ({
      images: p.images.map((i) => i.url),
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
          ? p.colors.map((c) => ({
              name: c.name,
              hexCode: c.hexCode,
              imageUrl: c.images[0]?.url ?? null,
            }))
          : undefined,
    }));
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Tienda | Casa Verde",
  description: "Descubre toda la colección de Casa Verde.",
};

export default async function TiendaPage() {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] selection:bg-[#C19A6B]/20 relative overflow-hidden">

      {/* Fondo decorativo sutil */}
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

          <CollectionHero title="TIENDA" />

          <div className="mt-12 sm:mt-16 lg:mt-24 w-full">
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-24 text-sm tracking-wide">
                No hay productos disponibles en este momento.
              </p>
            ) : (
              <ProductGrid products={products} viewMode="grid" />
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
