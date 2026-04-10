"use client";

import { useState, useCallback } from "react";
import { TOAST_DURATION } from "../constants/constants";
import type { ToastState } from "../types/types";
import { useCategoryList } from "./useCategoryList";
import { useCategoryForm } from "./useCategoryForm";

export function useCategoryManager() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const list = useCategoryList({ showToast });
  const form = useCategoryForm({ showToast, onSuccess: list.fetchCategories });

  return {
    toast,
    setToast,
    ...list,
    ...form,
    handleReorder: list.handleReorder,
  };
}
