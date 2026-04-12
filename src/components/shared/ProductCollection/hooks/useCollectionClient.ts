"use client";

import { useState, useMemo } from "react";
import type { CollectionProduct } from "../types";

export function useCollectionClient(products: CollectionProduct[]) {
  const [sortBy, setSortBy] = useState("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // hexCode con "#"
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const hasActiveFilters = !!(selectedColor || minPrice || maxPrice);

  function handleColorToggle(hexCode: string) {
    setSelectedColor((prev) => (prev === hexCode ? null : hexCode));
  }

  function handlePriceChange(key: "minPrice" | "maxPrice", value: string) {
    if (key === "minPrice") setMinPrice(value);
    else setMaxPrice(value);
  }

  function clearAllFilters() {
    setSelectedColor(null);
    setMinPrice("");
    setMaxPrice("");
  }

  const sortedProducts = useMemo(() => {
    let arr = [...products];

    // Filtro por color
    if (selectedColor) {
      arr = arr.filter((p) =>
        p.colors?.some((c) => c.hexCode === selectedColor)
      );
    }

    // Filtro por precio
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;
    if (min !== undefined && !isNaN(min)) arr = arr.filter((p) => p.price >= min);
    if (max !== undefined && !isNaN(max)) arr = arr.filter((p) => p.price <= max);

    // Ordenamiento
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
  }, [products, sortBy, selectedColor, minPrice, maxPrice]);

  return {
    sortBy,
    setSortBy,
    isFilterOpen,
    setIsFilterOpen,
    sortedProducts,
    hasActiveFilters,
    // Estado de filtros + callbacks para MobileFilterDrawer
    selectedColor,
    minPrice,
    maxPrice,
    handleColorToggle,
    handlePriceChange,
    clearAllFilters,
  };
}
