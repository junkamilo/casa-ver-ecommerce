"use client";

import { useState, useEffect, useCallback } from "react";
import { TOAST_DURATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type { UserProfile, ToastState } from "../types/types";

export function useProfileManager() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Change password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
      })
      .catch(() => showToast("error", ERROR_MESSAGES.load))
      .finally(() => setLoading(false));
  }, [showToast]);

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
        showToast("error", data.message || ERROR_MESSAGES.saveName);
        return;
      }
      setProfile(data);
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

  const handleChangePassword = async (e: React.FormEvent) => {
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

  const cancelPasswordSection = () => {
    setShowPasswordSection(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return {
    profile,
    loading,
    toast,
    setToast,
    // name
    editingName,
    setEditingName,
    name,
    setName,
    savingName,
    handleSaveName,
    cancelEditName,
    // password
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
