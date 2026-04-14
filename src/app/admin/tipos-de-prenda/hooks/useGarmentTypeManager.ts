"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { TOAST_DURATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants";
import type { GarmentType, ToastState } from "../types/types";

const PAGE_SIZE = 10;

export function useGarmentTypeManager() {
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  // ── Búsqueda + paginación ─────────────────────────────────────────────────
  const [search, setSearchRaw] = useState("");
  const [page, setPage] = useState(1);

  const setSearch = useCallback((v: string) => {
    setSearchRaw(v);
    setPage(1);
  }, []);

  const filteredGarmentTypes = useMemo(() => {
    if (!search.trim()) return garmentTypes;
    const q = search.toLowerCase();
    return garmentTypes.filter(
      (gt) => gt.name.toLowerCase().includes(q) || gt.slug.includes(q)
    );
  }, [garmentTypes, search]);

  const totalPages = Math.max(1, Math.ceil(filteredGarmentTypes.length / PAGE_SIZE));
  const paginatedGarmentTypes = filteredGarmentTypes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // ── Modal Crear ───────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Modal Editar ──────────────────────────────────────────────────────────
  const [editingGT, setEditingGT] = useState<GarmentType | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchGarmentTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/garment-types");
      if (res.ok) setGarmentTypes(await res.json());
    } catch {
      showToast("error", ERROR_MESSAGES.load);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchGarmentTypes(); }, [fetchGarmentTypes]);

  // ── Crear ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/garment-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        if (res.status === 409) throw new Error(ERROR_MESSAGES.duplicate);
        throw new Error(ERROR_MESSAGES.create);
      }
      showToast("success", SUCCESS_MESSAGES.created);
      setShowModal(false);
      setName("");
      fetchGarmentTypes();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    } finally {
      setSubmitting(false);
    }
  }, [name, showToast, fetchGarmentTypes]);

  // ── Editar ────────────────────────────────────────────────────────────────

  const openEditModal = useCallback((gt: GarmentType) => {
    setEditingGT(gt);
    setEditName(gt.name);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingGT(null);
    setEditName("");
  }, []);

  const handleEditSubmit = useCallback(async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!editingGT) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/admin/garment-types?id=${editingGT.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) {
        if (res.status === 409) throw new Error(ERROR_MESSAGES.duplicate);
        throw new Error(ERROR_MESSAGES.edit);
      }
      showToast("success", SUCCESS_MESSAGES.updated);
      closeEditModal();
      fetchGarmentTypes();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    } finally {
      setEditSubmitting(false);
    }
  }, [editingGT, editName, showToast, closeEditModal, fetchGarmentTypes]);

  // ── Toggle activo ─────────────────────────────────────────────────────────

  const handleToggleActive = useCallback(async (gt: GarmentType) => {
    try {
      const res = await fetch(`/api/admin/garment-types?id=${gt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });
      if (!res.ok) throw new Error(ERROR_MESSAGES.toggle);
      showToast("success", gt.isActive ? SUCCESS_MESSAGES.deactivated : SUCCESS_MESSAGES.activated);
      fetchGarmentTypes();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    }
  }, [showToast, fetchGarmentTypes]);

  // ── Eliminar ──────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (gt: GarmentType) => {
    try {
      const res = await fetch(`/api/admin/garment-types?id=${gt.id}`, { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json();
        showToast(
          "error",
          `No se puede eliminar "${data.name}". Hay ${data.count} producto(s) usando este tipo de prenda.`
        );
        return;
      }
      if (!res.ok) throw new Error(ERROR_MESSAGES.delete);

      showToast("success", SUCCESS_MESSAGES.deleted);
      fetchGarmentTypes();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    }
  }, [showToast, fetchGarmentTypes]);

  return {
    garmentTypes,
    loading,
    toast,
    // Búsqueda + paginación
    search, setSearch,
    page, setPage,
    pageSize: PAGE_SIZE,
    filteredGarmentTypes,
    paginatedGarmentTypes,
    totalPages,
    // Crear
    showModal, setShowModal,
    name, setName,
    submitting,
    handleSubmit,
    // Editar
    editingGT,
    editName, setEditName,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleEditSubmit,
    // Acciones
    handleToggleActive,
    handleDelete,
  };
}
