"use client";

import { useState, useEffect } from "react";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type {
  UseProfileNameOptions,
  UseProfileNameReturn,
} from "../types/types";
import {
  AdminProfileApiError,
  updateAdminProfile,
} from "@/modules/adminCatalog/profile/presentation/api-client";
import { mapAdminProfileDtoToUi } from "@/modules/adminCatalog/profile/presentation/mappers";

/**
 * Gestiona el estado y la lógica de edición del nombre del perfil.
 * Se sincroniza con `profile` cuando éste carga por primera vez.
 */
export function useProfileName({
  profile,
  showToast,
  onProfileUpdate,
}: UseProfileNameOptions): UseProfileNameReturn {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Sincroniza el campo cuando el perfil se carga inicialmente
  useEffect(() => {
    if (profile) setName(profile.name || "");
  }, [profile]);

  const handleSaveName = async (): Promise<void> => {
    setSavingName(true);
    try {
      const data = await updateAdminProfile({ name });
      onProfileUpdate(mapAdminProfileDtoToUi(data));
      setEditingName(false);
      showToast("success", SUCCESS_MESSAGES.nameSaved);
    } catch (error: unknown) {
      if (error instanceof AdminProfileApiError) {
        showToast("error", error.message || ERROR_MESSAGES.saveName);
        return;
      }
      showToast("error", ERROR_MESSAGES.connection);
    } finally {
      setSavingName(false);
    }
  };

  const cancelEditName = () => {
    setEditingName(false);
    setName(profile?.name || "");
  };

  return {
    editingName,
    setEditingName,
    name,
    setName,
    savingName,
    handleSaveName,
    cancelEditName,
  };
}
