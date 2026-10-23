"use client";

import { useEffect, useState } from "react";
import type { Category } from "../types";

/** Categorías principales publicadas por el POS (carrusel del home). */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pos-categories")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} en /api/pos-categories`);
        return r.json() as Promise<Category[]>;
      })
      .then(setCategories)
      .catch((error) => console.error("[useCategories]", error))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
