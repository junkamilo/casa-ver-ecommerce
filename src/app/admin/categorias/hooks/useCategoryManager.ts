"use client";

import { useState, useCallback, useEffect } from "react";
import { TOAST_DURATION } from "../constants/constants";
import type { GarmentTypeOption, ToastState } from "../types/types";
import { useCategoryList } from "./useCategoryList";
import { useCategoryForm } from "./useCategoryForm";

export function useCategoryManager() {
  const [toast, setToast] = useState<ToastState>(null);
  const [allGarmentTypes, setAllGarmentTypes] = useState<GarmentTypeOption[]>([]);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  // Cargar todos los tipos de prenda disponibles para el selector del modal
  useEffect(() => {
    fetch("/api/admin/garment-types")
      .then((r) => r.ok ? r.json() : [])
      .then((data) =>
        setAllGarmentTypes(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any[])
            .filter((gt) => gt.isActive)
            .map((gt) => ({ id: gt.id, name: gt.name }))
        )
      )
      .catch(() => {});
  }, []);

  const list = useCategoryList({ showToast });
  const form = useCategoryForm({ showToast, onSuccess: list.fetchCategories });

  return {
    toast,
    setToast,
    allGarmentTypes,
    ...list,
    ...form,
  };
}
