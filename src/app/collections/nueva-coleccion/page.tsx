import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import CollectionHero from "@/app/collections/[slug]/components/CollectionHero";
import CollectionClient from "@/app/collections/[slug]/components/CollectionClient";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import BackButton from "@/components/ui/BackButton";
import { fetchCollectionProducts } from "../utils/fetchCollectionProducts";
import { NEW_COLLECTION_WHERE, EMPTY_STATE_MESSAGE } from "./constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nuevos Ingresos | Casa Verde",
  description: "Descubre los últimos ingresos de nuestra colección.",
};

export default async function NuevaColeccionPage() {
  const { products, filterOptions } = await fetchCollectionProducts(NEW_COLLECTION_WHERE);

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
          <h1 className="sr-only">Nuevos Ingresos</h1>

          <BackButton className="mb-4 sm:mb-6" />

          <CollectionHero title="Nuevos Ingresos" />

          <div className="mt-4 sm:mt-6 lg:mt-8 w-full">
            {products.length === 0 ? (
              <SectionEmptyState message={EMPTY_STATE_MESSAGE} />
            ) : (
              <CollectionClient products={products} filterOptions={filterOptions} />
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
