"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { TOAST_DURATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants";
import type { Color, ToastState } from "../types/types";
import {
  AdminColorsApiError,
  createAdminColor,
  deleteAdminColor,
  fetchAdminColors,
  toggleAdminColor,
  updateAdminColor,
} from "@/modules/adminCatalog/colors/presentation/api-client";
import { mapColorListDtoToUi } from "@/modules/adminCatalog/colors/presentation/mappers";

const PAGE_SIZE = 12;

export function useColorManager() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  const [search, setSearchRaw] = useState("");
  const [page, setPage] = useState(1);

  const setSearch = useCallback((v: string) => {
    setSearchRaw(v);
    setPage(1);
  }, []);

  const filteredColors = useMemo(() => {
    if (!search.trim()) return colors;
    const q = search.toLowerCase();
    return colors.filter((c) => c.name.toLowerCase().includes(q) || c.hexCode.toLowerCase().includes(q));
  }, [colors, search]);

  const totalPages = Math.max(1, Math.ceil(filteredColors.length / PAGE_SIZE));
  const paginatedColors = filteredColors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Modal Crear ───────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState("#000000");
  const [submitting, setSubmitting] = useState(false);

  // ── Modal Editar ──────────────────────────────────────────────────────────
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [editName, setEditName] = useState("");
  const [editHexCode, setEditHexCode] = useState("#000000");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchColors = useCallback(async () => {
    try {
      const data = await fetchAdminColors();
      setColors(mapColorListDtoToUi(data));
    } catch (error: unknown) {
      if (error instanceof AdminColorsApiError) {
        showToast("error", error.message);
        return;
      }
      showToast("error", ERROR_MESSAGES.load);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchColors(); }, [fetchColors]);

  // ── Crear ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAdminColor({ name, hexCode });
      showToast("success", SUCCESS_MESSAGES.created);
      setShowModal(false);
      setName("");
      setHexCode("#000000");
      fetchColors();
    } catch (err: unknown) {
      if (err instanceof AdminColorsApiError && err.status === 409) {
        showToast("error", ERROR_MESSAGES.duplicate);
        return;
      }
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    } finally {
      setSubmitting(false);
    }
  }, [name, hexCode, showToast, fetchColors]);

  // ── Editar ────────────────────────────────────────────────────────────────

  const openEditModal = useCallback((color: Color) => {
    setEditingColor(color);
    setEditName(color.name);
    setEditHexCode(color.hexCode);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingColor(null);
    setEditName("");
    setEditHexCode("#000000");
  }, []);

  const handleEditSubmit = useCallback(async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!editingColor) return;
    setEditSubmitting(true);
    try {
      await updateAdminColor(editingColor.id, { name: editName, hexCode: editHexCode });
      showToast("success", SUCCESS_MESSAGES.updated);
      closeEditModal();
      fetchColors();
    } catch (err: unknown) {
      if (err instanceof AdminColorsApiError && err.status === 409) {
        showToast("error", ERROR_MESSAGES.duplicate);
        return;
      }
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    } finally {
      setEditSubmitting(false);
    }
  }, [editingColor, editName, editHexCode, showToast, closeEditModal, fetchColors]);

  // ── Toggle activo ─────────────────────────────────────────────────────────

  const handleToggleActive = useCallback(async (color: Color) => {
    try {
      await toggleAdminColor(color.id);
      showToast("success", color.isActive ? SUCCESS_MESSAGES.deactivated : SUCCESS_MESSAGES.activated);
      fetchColors();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    }
  }, [showToast, fetchColors]);

  // ── Eliminar ──────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (color: Color) => {
    try {
      await deleteAdminColor(color.id);
      showToast("success", SUCCESS_MESSAGES.deleted);
      fetchColors();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    }
  }, [showToast, fetchColors]);

  return {
    colors,
    loading,
    toast,
    search, setSearch,
    page, setPage,
    pageSize: PAGE_SIZE,
    filteredColors,
    paginatedColors,
    totalPages,
    showModal, setShowModal,
    name, setName,
    hexCode, setHexCode,
    submitting,
    handleSubmit,
    editingColor,
    editName, setEditName,
    editHexCode, setEditHexCode,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleEditSubmit,
    handleToggleActive,
    handleDelete,
  };
}
