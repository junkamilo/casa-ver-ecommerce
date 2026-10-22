"use client";

import { useEffect, useState } from "react";
import type { Category } from "../types";

async function fetchCategories(url: string): Promise<Category[]> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
  return r.json();
}

/** Categorías del POS primero y después las de la web; si una fuente falla se muestra la otra. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([fetchCategories("/api/pos-categories"), fetchCategories("/api/categories")])
      .then(([pos, web]) => {
        const list: Category[] = [];
        for (const result of [pos, web]) {
          if (result.status === "fulfilled") list.push(...result.value);
          else console.error("[useCategories]", result.reason);
        }
        setCategories(list);
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
