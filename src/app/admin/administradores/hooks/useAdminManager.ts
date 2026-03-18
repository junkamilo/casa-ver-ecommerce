"use client";

import { useState, useEffect, useCallback } from "react";
import { generatePassword, TOAST_DURATION, PAGE_SIZE } from "../constants/constants";
import type { Admin, LookupResult, ToastState } from "../types/types";

export function useAdminManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Lookup de email
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState>(null);

  // Confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
        setFilteredAdmins(data);
      }
    } catch {
      showToast("error", "Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    const results = admins.filter(
      (admin) =>
        (admin.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (admin.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(results);
    setPage(1);
  }, [searchTerm, admins]);

  const totalPages = Math.ceil(filteredAdmins.length / PAGE_SIZE);
  const pagedAdmins = filteredAdmins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isExistingUser = lookupResult?.exists === true && !lookupResult?.isAdmin;
  const isAlreadyAdmin = lookupResult?.exists === true && lookupResult?.isAdmin === true;

  // ─── Lookup individual (se llama desde el efecto) ───────────────────────────
  const onLookupEmail = useCallback(async (emailToCheck: string) => {
    setLookingUp(true);
    setLookupDone(false);
    try {
      const res = await fetch(`/api/admin/users?lookup=${encodeURIComponent(emailToCheck)}`);
      if (res.ok) {
        const data: LookupResult = await res.json();
        setLookupResult(data);
      } else {
        // API falló → asumir correo no encontrado para no bloquear al admin
        setLookupResult({ exists: false });
      }
    } catch {
      // Error de red → asumir correo no encontrado
      setLookupResult({ exists: false });
    } finally {
      setLookingUp(false);
      setLookupDone(true); // ← SIEMPRE marcar como terminado
    }
  }, []);

  // ─── Debounce: cada vez que cambia el email, resetea y programa nueva búsqueda ──
  useEffect(() => {
    // Reset inmediato al editar el email
    setLookupResult(null);
    setLookupDone(false);
    setLookingUp(false);

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !isValid) return;

    const timer = setTimeout(() => {
      onLookupEmail(email);
    }, 600);

    return () => clearTimeout(timer);
  }, [email, onLookupEmail]);

  const onGeneratePassword = useCallback(() => {
    setPassword(generatePassword());
    setShowPassword(true);
  }, []);

  const onCopyPassword = useCallback(() => {
    navigator.clipboard.writeText(password);
    showToast("success", "Contraseña copiada al portapapeles");
  }, [password, showToast]);

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setLookupResult(null);
    setLookupDone(false);
    setLookingUp(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = isExistingUser ? { email } : { name, email, password };
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.message || "Error al crear admin");
        return;
      }

      if (data.promoted) {
        showToast("success", `${data.name || data.email} fue promovido a administrador`);
      } else {
        showToast("success", `Admin "${data.name}" creado exitosamente`);
      }

      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.message || "Error al revocar admin");
        return;
      }

      showToast("success", "Acceso de administrador revocado");
      setConfirmDelete(null);
      fetchAdmins();
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setDeleting(false);
    }
  };

  return {
    admins,
    filteredAdmins,
    pagedAdmins,
    page,
    setPage,
    totalPages,
    loading,
    searchTerm,
    setSearchTerm,
    showModal,
    setShowModal,
    submitting,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    lookupResult,
    lookingUp,
    lookupDone,
    isExistingUser,
    isAlreadyAdmin,
    toast,
    setToast,
    confirmDelete,
    setConfirmDelete,
    deleting,
    onGeneratePassword,
    onCopyPassword,
    handleSubmit,
    handleDelete,
    resetForm,
  };
}
