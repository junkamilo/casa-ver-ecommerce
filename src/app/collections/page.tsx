import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import CollectionHero from "@/app/collections/[slug]/components/CollectionHero";
import CategoriesClient from "@/app/collections/components/CategoriesClient";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import BackButton from "@/components/ui/BackButton";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Colecciones",
  description:
    "Explora todas las colecciones de Casa Verde. Encuentra la categoría perfecta para tu estilo natural.",
  openGraph: {
    title: "Colecciones | Casa Verde",
    description: "Explora todas las colecciones de Casa Verde.",
    type: "website",
  },
};

export default async function CollectionsPage() {
  const collections = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, image: true },
  });

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
          <h1 className="sr-only">Colecciones</h1>

          <BackButton className="mb-4 sm:mb-6" />

          <CollectionHero title="Nuestro Catálogo" />

          <div className="mt-4 sm:mt-6 lg:mt-8 w-full">
            {collections.length === 0 ? (
              <SectionEmptyState message="Pronto agregaremos nuevas categorías y colecciones." />
            ) : (
              <CategoriesClient categories={collections} />
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
