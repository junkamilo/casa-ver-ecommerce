"use client";

import { useState, useEffect } from "react";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type {
  UseProfileNameOptions,
  UseProfileNameReturn,
} from "../types/types";

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
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.message || ERROR_MESSAGES.saveName);
        return;
      }
      onProfileUpdate(data);
      setEditingName(false);
      showToast("success", SUCCESS_MESSAGES.nameSaved);
    } catch {
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
