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

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  const filtered = sorted.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleReorder = useCallback(
    async (category: Category, direction: "up" | "down") => {
      const idx = sorted.findIndex((c) => c.id === category.id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;

      const other = sorted[swapIdx];

      // Optimistic update
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === category.id) return { ...c, order: other.order };
          if (c.id === other.id) return { ...c, order: category.order };
          return c;
        })
      );

      try {
        const res = await fetch("/api/admin/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "swap-orders", id1: category.id, id2: other.id }),
        });
        if (!res.ok) throw new Error(ERROR_MESSAGES.unknown);
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
        fetchCategories(); // revert on error
      }
    },
    [sorted, showToast, fetchCategories]
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
    handleReorder,
  };
}
