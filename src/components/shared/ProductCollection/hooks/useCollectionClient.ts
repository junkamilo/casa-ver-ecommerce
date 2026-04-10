"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { CollectionProduct } from "../types";

export function useCollectionClient(products: CollectionProduct[]) {
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

  return {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    isFilterOpen,
    setIsFilterOpen,
    sortedProducts,
    hasActiveFilters,
  };
}
