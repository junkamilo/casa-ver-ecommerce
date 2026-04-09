"use client";

import { useState } from "react";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type {
  UseProfilePasswordOptions,
  UseProfilePasswordReturn,
} from "../types/types";

/**
 * Gestiona el estado y la lógica del formulario de cambio de contraseña.
 * Valida que las contraseñas coincidan antes de enviar al servidor.
 */
export function useProfilePassword({
  showToast,
}: UseProfilePasswordOptions): UseProfilePasswordReturn {
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const cancelPasswordSection = () => {
    setShowPasswordSection(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", ERROR_MESSAGES.passwordMismatch);
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.message || ERROR_MESSAGES.changePassword);
        return;
      }
      showToast("success", SUCCESS_MESSAGES.passwordChanged);
      cancelPasswordSection();
    } catch {
      showToast("error", ERROR_MESSAGES.connection);
    } finally {
      setSavingPassword(false);
    }
  };

  return {
    showPasswordSection,
    setShowPasswordSection,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPw,
    setShowCurrentPw,
    showNewPw,
    setShowNewPw,
    savingPassword,
    handleChangePassword,
    cancelPasswordSection,
  };
}
