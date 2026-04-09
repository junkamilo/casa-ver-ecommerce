"use client";

import { useEffect, useState } from "react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Category[]) => setCategories(data))
      .catch((err) => console.error("[useCategories]", err))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
