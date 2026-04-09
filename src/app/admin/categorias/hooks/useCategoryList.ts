"use client";

import { useState, useEffect, useCallback } from "react";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type { Category } from "../types/types";

interface UseCategoryListOptions {
  showToast: (type: "success" | "error", message: string) => void;
}

export function useCategoryList({ showToast }: UseCategoryListOptions) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      showToast("error", ERROR_MESSAGES.load);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = useCallback(
    async (category: Category) => {
      try {
        const res = await fetch(`/api/admin/categories?id=${category.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle" }),
        });

        if (res.status === 409) {
          const data = await res.json();
          const count: number = data.count;
          showToast(
            "error",
            `No se puede ocultar esta categoría. Hay ${count} producto${count === 1 ? "" : "s"} asociado${count === 1 ? "" : "s"} a "${data.name}". Reasigna u oculta esos productos primero.`
          );
          return;
        }

        if (!res.ok) throw new Error(ERROR_MESSAGES.toggle);

        showToast(
          "success",
          category.isActive ? SUCCESS_MESSAGES.deactivated : SUCCESS_MESSAGES.activated
        );
        fetchCategories();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
      }
    },
    [showToast, fetchCategories]
  );

  return {
    categories,
    filtered,
    loading,
    search,
    setSearch,
    fetchCategories,
    handleToggleActive,
  };
}
