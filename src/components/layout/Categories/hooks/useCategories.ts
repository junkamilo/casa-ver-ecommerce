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
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data: Category[]) =>
        setCategories(data.filter((c) => c.isActive))
      )
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
