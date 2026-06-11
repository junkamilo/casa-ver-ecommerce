"use client";

import { useState, useEffect } from "react";
import type { CategoryData } from "@/modules/collections/contracts/collection-product.dto";

interface UseCollectionReturn {
  isAvailabilityOpen: boolean;
  setIsAvailabilityOpen: (v: boolean) => void;
  isPriceOpen: boolean;
  setIsPriceOpen: (v: boolean) => void;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (v: boolean) => void;
  category: CategoryData | null;
  title: string;
}

/**
 * Hook UI para la página `/collections/[slug]`. Maneja:
 *  - Estado local de los acordeones de filtro (disponibilidad / precio).
 *  - Estado del drawer de filtros móvil.
 *  - Hidratación del detalle de categoría desde `/api/categories/[slug]`
 *    (para mostrar nombre/descripción/banner sin dependerlo del SSR).
 */
export function useCollection(slug: string): UseCollectionReturn {
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [category, setCategory] = useState<CategoryData | null>(null);

  useEffect(() => {
    fetch(`/api/categories/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCategory(data))
      .catch(() => {});
  }, [slug]);

  const title = category?.name?.toUpperCase() ?? slug.replace(/-/g, " ").toUpperCase();

  return {
    isAvailabilityOpen,
    setIsAvailabilityOpen,
    isPriceOpen,
    setIsPriceOpen,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    category,
    title,
  };
}
