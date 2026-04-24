"use client";

import { useState, useEffect, useCallback } from "react";
import { useProfileName } from "./useProfileName";
import { useProfilePassword } from "./useProfilePassword";
import { TOAST_DURATION, ERROR_MESSAGES } from "../constants/constants";
import type {
  UserProfile,
  ToastState,
  UseProfileManagerReturn,
} from "../types/types";
import { fetchAdminProfile } from "@/modules/adminCatalog/profile/presentation/api-client";
import { mapAdminProfileDtoToUi } from "@/modules/adminCatalog/profile/presentation/mappers";

/**
 * Hook orquestador del perfil de administrador.
 * - Carga el perfil desde la API
 * - Gestiona las notificaciones toast
 * - Compone useProfileName + useProfilePassword
 *
 * Retorna un objeto plano compatible con el contrato de page.tsx.
 */
export function useProfileManager(): UseProfileManagerReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  useEffect(() => {
    fetchAdminProfile()
      .then((data) => setProfile(mapAdminProfileDtoToUi(data)))
      .catch(() => showToast("error", ERROR_MESSAGES.load))
      .finally(() => setLoading(false));
  }, [showToast]);

  const nameHook = useProfileName({
    profile,
    showToast,
    onProfileUpdate: setProfile,
  });

  const passwordHook = useProfilePassword({ showToast });

  return {
    profile,
    loading,
    toast,
    setToast,
    ...nameHook,
    ...passwordHook,
  };
}
