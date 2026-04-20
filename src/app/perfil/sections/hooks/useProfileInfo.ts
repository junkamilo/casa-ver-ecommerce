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
      if (!res.ok) { onToast("error", data.message); return; }
      onProfileUpdate(data);
      setEditingName(false);
      onToast("success", "Nombre actualizado");
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingName(false);
    }
  };

  // ── Phone ──
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [savingPhone, setSavingPhone] = useState(false);

  const startEditPhone = () => setEditingPhone(true);
  const cancelEditPhone = () => {
    setEditingPhone(false);
    setPhone(profile.phone ?? "");
  };

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { onToast("error", data.message); return; }
      onProfileUpdate(data);
      setEditingPhone(false);
      onToast("success", "Teléfono actualizado");
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingPhone(false);
    }
  };

  // ── Cedula ──
  const [editingCedula, setEditingCedula] = useState(false);
  const [cedula, setCedula] = useState(profile.cedula ?? "");
  const [savingCedula, setSavingCedula] = useState(false);

  const startEditCedula = () => setEditingCedula(true);
  const cancelEditCedula = () => {
    setEditingCedula(false);
    setCedula(profile.cedula ?? "");
  };

  const handleSaveCedula = async () => {
    if (cedula && !/^\d{6,12}$/.test(cedula)) {
      onToast("error", "Cédula inválida (6–12 dígitos numéricos)");
      return;
    }
    setSavingCedula(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula }),
      });
      const data = await res.json();
      if (!res.ok) { onToast("error", data.message); return; }
      onProfileUpdate(data);
      setEditingCedula(false);
      onToast("success", "Cédula actualizada");
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingCedula(false);
    }
  };

  // ── Recovery email ──
  const [editingRecoveryEmail, setEditingRecoveryEmail] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(profile.recoveryEmail ?? "");
  const [savingRecoveryEmail, setSavingRecoveryEmail] = useState(false);

  const startEditRecoveryEmail = () => setEditingRecoveryEmail(true);
  const cancelEditRecoveryEmail = () => {
    setEditingRecoveryEmail(false);
    setRecoveryEmail(profile.recoveryEmail ?? "");
  };

  const handleSaveRecoveryEmail = async () => {
    setSavingRecoveryEmail(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryEmail }),
      });
      const data = await res.json();
      if (!res.ok) { onToast("error", data.message); return; }
      onProfileUpdate(data);
      setEditingRecoveryEmail(false);
      onToast("success", "Email de recuperación actualizado");
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingRecoveryEmail(false);
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
      if (!res.ok) { onToast("error", data.message); return; }
      onToast("success", "Contraseña actualizada correctamente");
      cancelPasswordForm();
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingPassword(false);
    }
  };

  return {
    editingName, name, savingName, setName, startEditName, cancelEditName, handleSaveName,
    editingPhone, phone, savingPhone, setPhone, startEditPhone, cancelEditPhone, handleSavePhone,
    editingCedula, cedula, savingCedula, setCedula, startEditCedula, cancelEditCedula, handleSaveCedula,
    editingRecoveryEmail, recoveryEmail, savingRecoveryEmail, setRecoveryEmail,
    startEditRecoveryEmail, cancelEditRecoveryEmail, handleSaveRecoveryEmail,
    showPasswordSection, currentPassword, newPassword, confirmPassword,
    showCurrentPw, showNewPw, savingPassword,
    setCurrentPassword, setNewPassword, setConfirmPassword,
    toggleCurrentPw, toggleNewPw, showPasswordForm, cancelPasswordForm, handleChangePassword,
  };
}
