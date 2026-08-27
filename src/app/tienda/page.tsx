import type { Metadata } from "next";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import CollectionHero from "@/app/collections/[slug]/components/CollectionHero";
import CollectionClient from "@/components/shared/ProductCollection/components/CollectionClient";
import BackButton from "@/components/ui/BackButton";
import {
  CatalogListingSearch,
  catalogSearchEmptyMessage,
} from "@/components/search";
import { getAllProducts } from "./services";
import type { TiendaFilters } from "./types";
import TiendaPagination from "./components/TiendaPagination";

// ISR: la página se cachea y se regenera como máximo cada 60 s.
// Cada combinación de filtros (URL única) tiene su propia entrada de caché.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Descubre toda la colección de Casa Verde. Ropa con esencia natural, calidad colombiana y envíos a todo el país.",
  openGraph: {
    title: "Tienda | Casa Verde",
    description:
      "Descubre toda la colección de Casa Verde. Ropa con esencia natural y calidad colombiana.",
    type: "website",
  },
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<TiendaFilters>;
}) {
  const filters = await searchParams;
  const { products, filterOptions, page, totalPages, totalProducts } =
    await getAllProducts(filters);

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

          <CatalogListingSearch placeholder="Buscar en tienda..." />

          <div className="mt-4 sm:mt-6 lg:mt-8 w-full">
            <CollectionClient
              products={products}
              filterOptions={filterOptions}
              emptyMessage={catalogSearchEmptyMessage(filters.q)}
            />
            <TiendaPagination
              page={page}
              totalPages={totalPages}
              totalProducts={totalProducts}
              filters={filters}
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
