"use client";

import { useState } from "react";
import { FilterSidebar } from "./FilterSidebar";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { ProductToolbar } from "./ProductToolbar";
import { ProductGrid } from "./ProductGrid";
import type { CollectionProduct } from "../types";

interface CollectionClientProps {
  products: CollectionProduct[];
}

export default function CollectionClient({ products }: CollectionClientProps) {
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
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
          count={products.length}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        />
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
