"use client";

import { use } from "react";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";

import { useCollection } from "./hooks/useCollection";
import { COLLECTION_PRODUCTS } from "./constants";
import CollectionHero from "./components/CollectionHero";
import { FilterSidebar } from "./components/FilterSidebar";
import { MobileFilterDrawer } from "./components/MobileFilterDrawer";
import { ProductToolbar } from "./components/ProductToolbar";
import { ProductGrid } from "./components/ProductGrid";

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const {
    isAvailabilityOpen,
    setIsAvailabilityOpen,
    isPriceOpen,
    setIsPriceOpen,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    category,
    title,
  } = useCollection(slug);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <CollectionHero
          title={title}
          description={category?.description}
          imageUrl={category?.bannerImage}
        />

        <div className="flex flex-col mb-8">
          <h1 className="sr-only">{title}</h1>

          <div className="flex items-start gap-6 lg:gap-12">
            <MobileFilterDrawer
              isOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
              isAvailabilityOpen={isAvailabilityOpen}
              onToggleAvailability={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
              isPriceOpen={isPriceOpen}
              onTogglePrice={() => setIsPriceOpen(!isPriceOpen)}
            />

            <FilterSidebar
              isAvailabilityOpen={isAvailabilityOpen}
              onToggleAvailability={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
              isPriceOpen={isPriceOpen}
              onTogglePrice={() => setIsPriceOpen(!isPriceOpen)}
            />

            <div className="flex-1">
              <ProductToolbar
                count={COLLECTION_PRODUCTS.length}
                onOpenMobileFilters={() => setMobileFiltersOpen(true)}
              />
              <ProductGrid products={COLLECTION_PRODUCTS} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
