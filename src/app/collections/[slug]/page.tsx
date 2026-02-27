import { prisma } from "@/lib/prisma";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import CollectionHero from "./components/CollectionHero";
import CollectionClient from "./components/CollectionClient";
import type { CollectionProduct } from "./types";

async function getCollectionData(slug: string): Promise<{
  category: { name: string; description?: string | null; bannerImage?: string | null } | null;
  products: CollectionProduct[];
}> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      select: { name: true, description: true, bannerImage: true },
    });

    if (!category) return { category: null, products: [] };

    const raw = await prisma.product.findMany({
      where: { category: { slug }, status: "ACTIVE" },
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
          take: 1,
          select: { url: true },
        },
        colors: {
          select: { name: true, hexCode: true },
          take: 4,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products: CollectionProduct[] = raw.map((p) => ({
      mediaUrl: p.images[0]?.url ?? null,
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
      colors: p.colors.length > 0 ? p.colors : undefined,
    }));

    return { category, products };
  } catch {
    return { category: null, products: [] };
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category, products } = await getCollectionData(slug);
  const title = category?.name?.toUpperCase() ?? slug.replace(/-/g, " ").toUpperCase();

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <CollectionHero
          title={title}
          description={category?.description}
          imageUrl={category?.bannerImage ?? undefined}
        />

        <div className="flex flex-col mb-8">
          <h1 className="sr-only">{title}</h1>
          <CollectionClient products={products} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
