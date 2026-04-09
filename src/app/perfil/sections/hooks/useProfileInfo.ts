"use client";

import { useState } from "react";
import { UseProfileInfoOptions, UseProfileInfoResult } from "../types";

export function useProfileInfo({
  profile,
  onProfileUpdate,
  onToast,
}: UseProfileInfoOptions): UseProfileInfoResult {
  // ── Name ──
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const startEditName = () => setEditingName(true);
  const cancelEditName = () => {
    setEditingName(false);
    setName(profile.name ?? "");
  };

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        onToast("error", data.message);
        return;
      }
      onProfileUpdate(data);
      setEditingName(false);
      onToast("success", "Nombre actualizado");
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingName(false);
    }
  };

  // ── Password ──
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const showPasswordForm = () => setShowPasswordSection(true);
  const cancelPasswordForm = () => {
    setShowPasswordSection(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  const toggleCurrentPw = () => setShowCurrentPw((prev) => !prev);
  const toggleNewPw = () => setShowNewPw((prev) => !prev);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onToast("error", "Las contraseñas no coinciden");
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
        onToast("error", data.message);
        return;
      }
      onToast("success", "Contraseña actualizada correctamente");
      cancelPasswordForm();
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingPassword(false);
    }
  };

  return {
    editingName,
    name,
    savingName,
    setName,
    startEditName,
    cancelEditName,
    handleSaveName,
    showPasswordSection,
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrentPw,
    showNewPw,
    savingPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    toggleCurrentPw,
    toggleNewPw,
    showPasswordForm,
    cancelPasswordForm,
    handleChangePassword,
  };
}
