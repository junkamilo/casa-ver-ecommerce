"use client";

import { ProductToolbar } from "./ProductToolbar";
import { ProductGrid } from "./ProductGrid";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { useCollectionClient } from "../hooks/useCollectionClient";
import { CollectionClientProps } from '../types/index';



export default function CollectionClient({ products, filterOptions, setItemKey }: CollectionClientProps) {
  const {
    sortBy,
    setSortBy,
    isFilterOpen,
    setIsFilterOpen,
    sortedProducts,
    hasActiveFilters,
    selectedColor,
    minPrice,
    maxPrice,
    handleColorToggle,
    handlePriceChange,
    clearAllFilters,
  } = useCollectionClient(products);

  return (
    <>
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        availableColors={filterOptions.availableColors}
        maxPriceDb={filterOptions.maxPriceDb}
        selectedColor={selectedColor}
        minPrice={minPrice}
        maxPrice={maxPrice}
        hasActiveFilters={hasActiveFilters}
        onColorToggle={handleColorToggle}
        onPriceChange={handlePriceChange}
        onClearFilters={clearAllFilters}
      />

      <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-15px_rgba(21,71,52,0.05)] border border-gray-100/80 relative overflow-hidden isolate transition-all duration-500">

          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C19A6B]/5 to-transparent rounded-bl-full pointer-events-none -z-10" />

          <ProductToolbar
            count={sortedProducts.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onFilterOpen={() => setIsFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />

          <div className="mt-8 sm:mt-10">
            <ProductGrid products={sortedProducts} setItemKey={setItemKey} />
          </div>

        </div>
      </div>
    </>
  );
}
