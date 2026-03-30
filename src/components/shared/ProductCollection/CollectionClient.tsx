"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductToolbar } from "./ProductToolbar";
import { ProductGrid } from "./ProductGrid";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import type { CollectionProduct, FilterOptions } from "./types";

interface CollectionClientProps {
  products: CollectionProduct[];
  filterOptions: FilterOptions;
}

export default function CollectionClient({ products, filterOptions }: CollectionClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const searchParams = useSearchParams();
  const hasActiveFilters = !!(
    searchParams.get("color") ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice")
  );

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case "price-desc":
        return arr.sort((a, b) => b.price - a.price);
      case "price-asc":
        return arr.sort((a, b) => a.price - b.price);
      case "featured":
        return arr.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
      default:
        return arr;
    }
  }, [products, sortBy]);

  return (
    <>
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        availableColors={filterOptions.availableColors}
        maxPriceDb={filterOptions.maxPriceDb}
      />

      <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-15px_rgba(21,71,52,0.05)] border border-gray-100/80 relative overflow-hidden isolate transition-all duration-500">

          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C19A6B]/5 to-transparent rounded-bl-full pointer-events-none -z-10" />

          <ProductToolbar
            count={sortedProducts.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onFilterOpen={() => setIsFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />

          <div className="mt-8 sm:mt-10">
            <ProductGrid products={sortedProducts} viewMode={viewMode} />
          </div>

        </div>
      </div>
    </>
  );
}
