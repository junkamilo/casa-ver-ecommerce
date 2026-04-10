import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import CollectionHero from "@/app/collections/[slug]/components/CollectionHero";
import CollectionClient from "@/components/shared/ProductCollection/components/CollectionClient";
import BackButton from "@/components/ui/BackButton";
import { getAllProducts } from "./services";
import type { TiendaFilters } from "./types";

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
