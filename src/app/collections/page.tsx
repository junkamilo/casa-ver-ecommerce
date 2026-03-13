import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CategoryCard from "@/components/layout/Categories/components/CategoryCard";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";

export const revalidate = 3600;

export default async function CollectionsPage() {
  const collections = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, image: true },
  });

  return (
    <>
      <AnnouncementBar />
      <main className="min-h-screen bg-[#FAFAFA]">

        {/* ── Encabezado ── */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 border-b border-[#C19A6B]/10">
          <div className="max-w-7xl 2xl:max-w-6xl mx-auto">
            <p className="text-[10px] sm:text-[11px] font-black tracking-[0.32em] uppercase text-[#C19A6B] mb-3">
              <Link href="/" className="hover:underline decoration-[#C19A6B]">Inicio</Link>
              <span className="mx-2 opacity-50">/</span>
              Colecciones
            </p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-light text-[#154734] leading-none"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Nuestro <span className="italic text-[#C19A6B]">Catálogo</span>
            </h1>
          </div>
        </section>

        {/* ── Grid de categorías ── */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-7xl 2xl:max-w-6xl mx-auto">

            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <span className="w-8 h-8 rounded-full border-2 border-[#C19A6B]/40 border-t-[#C19A6B] animate-spin" aria-hidden="true" />
                <p
                  className="text-lg sm:text-xl font-light text-[#154734]/60 italic max-w-sm"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Pronto agregaremos nuevas colecciones. Vuelve pronto.
                </p>
                <span className="h-px w-12 bg-[#C19A6B]/40 mt-2" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {collections.map((col) => (
                  <CategoryCard
                    key={col.id}
                    image={col.image ?? null}
                    label={col.name}
                    slug={col.slug}
                  />
                ))}
              </div>
            )}

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
