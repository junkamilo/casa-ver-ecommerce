"use client";

import { useState, useEffect, useCallback } from "react";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type { Category } from "../types/types";
import { toast } from "sonner";
import {
  CategoryApiError,
  deleteCategory,
  fetchCategories as fetchCategoriesRequest,
  toggleCategory,
} from "@/modules/adminCatalog/categories/presentation/api-client";
import { mapCategoryDtoListToUi } from "@/modules/adminCatalog/categories/presentation/mappers";

interface UseCategoryListOptions {
  showToast: (type: "success" | "error", message: string) => void;
}

export function useCategoryList({ showToast }: UseCategoryListOptions) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchCategoriesRequest();
      setCategories(mapCategoryDtoListToUi(data));
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

  const handleToggleActive = useCallback(
    async (category: Category) => {
      try {
        await toggleCategory(category.id);
        showToast(
          "success",
          category.isActive ? SUCCESS_MESSAGES.deactivated : SUCCESS_MESSAGES.activated
        );
        fetchCategories();
      } catch (err: unknown) {
        if (err instanceof CategoryApiError && err.status === 409) {
          const count = err.data?.count ?? 0;
          showToast(
            "error",
            `No se puede ocultar esta categoría. Hay ${count} producto${count === 1 ? "" : "s"} asociado${count === 1 ? "" : "s"} a "${err.data?.name ?? category.name}". Reasigna u oculta esos productos primero.`
          );
          return;
        }
        showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
      }
    },
    [showToast, fetchCategories]
  );

  const confirmDeleteWithAlert = useCallback((categoryName: string) => {
    return new Promise<boolean>((resolve) => {
      let settled = false;

      const resolveOnce = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      const toastId = toast.warning("¿Eliminar categoría?", {
        description: `Se eliminará "${categoryName}". Esta acción no se puede deshacer.`,
        duration: 10000,
        action: {
          label: "Eliminar",
          onClick: () => {
            resolveOnce(true);
            toast.dismiss(toastId);
          },
        },
        cancel: {
          label: "Cancelar",
          onClick: () => {
            resolveOnce(false);
            toast.dismiss(toastId);
          },
        },
        onDismiss: () => resolveOnce(false),
      });
    });
  }, []);

  const handleDelete = useCallback(
    async (category: Category) => {
      const confirmed = await confirmDeleteWithAlert(category.name);
      if (!confirmed) return;

      try {
        await deleteCategory(category.id);
        showToast("success", SUCCESS_MESSAGES.deleted);
        fetchCategories();
      } catch (err: unknown) {
        if (err instanceof CategoryApiError && err.status === 409) {
          const count = err.data?.count ?? 0;
          showToast(
            "error",
            `No se puede eliminar "${err.data?.name ?? category.name}". Tiene ${count} producto${count === 1 ? "" : "s"} activo${count === 1 ? "" : "s"} relacionado${count === 1 ? "" : "s"}.`
          );
          return;
        }
        showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
      }
    },
    [showToast, fetchCategories, confirmDeleteWithAlert]
  );

  return {
    categories,
    filtered,
    loading,
    search,
    setSearch,
    fetchCategories,
    handleToggleActive,
    handleDelete,
  };
}
