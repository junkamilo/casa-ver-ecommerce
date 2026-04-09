"use client";

import { useState, useCallback } from "react";
import { TOAST_DURATION } from "../constants/constants";
import type { ToastState } from "../types/types";
import { useAdminList } from "./useAdminList";
import { useAdminForm } from "./useAdminForm";

export function useAdminManager() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const list = useAdminList({ showToast });
  const form = useAdminForm({ showToast, onSuccess: list.fetchAdmins });

  return {
    toast,
    setToast,
    ...list,
    ...form,
  };
}
