"use client";

import { useState, useCallback } from "react";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type { Category } from "../types/types";
import {
  CategoryApiError,
  createCategory,
  updateCategory,
} from "@/modules/adminCatalog/categories/presentation/api-client";

interface UseCategoryFormOptions {
  showToast: (type: "success" | "error", message: string) => void;
  onSuccess: () => void;
}

export function useCategoryForm({ showToast, onSuccess }: UseCategoryFormOptions) {
  // ── Estado: modal crear ───────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [garmentTypeIds, setGarmentTypeIds] = useState<string[]>([]);

  // ── Estado: modal editar ──────────────────────────────────────────────────
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editGarmentTypeIds, setEditGarmentTypeIds] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ── Crear ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: { preventDefault(): void }) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        await createCategory({ name, image, garmentTypeIds });

        showToast("success", SUCCESS_MESSAGES.created);
        setShowModal(false);
        setName("");
        setImage("");
        setGarmentTypeIds([]);
        onSuccess();
      } catch (err: unknown) {
        if (err instanceof CategoryApiError && err.status === 409) {
          showToast("error", ERROR_MESSAGES.duplicate);
          return;
        }

        showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
      } finally {
        setSubmitting(false);
      }
    },
    [name, image, garmentTypeIds, showToast, onSuccess]
  );

  // ── Editar ────────────────────────────────────────────────────────────────

  const openEditModal = useCallback((category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditImage(category.image ?? "");
    setEditGarmentTypeIds((category.garmentTypes ?? []).map((gt) => gt.id));
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingCategory(null);
    setEditName("");
    setEditImage("");
    setEditGarmentTypeIds([]);
  }, []);

  const handleEditSubmit = useCallback(
    async (e: { preventDefault(): void }) => {
      e.preventDefault();
      if (!editingCategory) return;
      setEditSubmitting(true);
      try {
        await updateCategory(editingCategory.id, {
          name: editName,
          image: editImage,
          garmentTypeIds: editGarmentTypeIds,
        });

        showToast("success", SUCCESS_MESSAGES.updated);
        closeEditModal();
        onSuccess();
      } catch (err: unknown) {
        if (err instanceof CategoryApiError && err.status === 409) {
          showToast("error", ERROR_MESSAGES.duplicate);
          return;
        }

        showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
      } finally {
        setEditSubmitting(false);
      }
    },
    [editingCategory, editName, editImage, editGarmentTypeIds, showToast, closeEditModal, onSuccess]
  );

  return {
    showModal,
    setShowModal,
    submitting,
    name,
    setName,
    image,
    setImage,
    garmentTypeIds,
    setGarmentTypeIds,
    handleSubmit,
    editingCategory,
    editName,
    setEditName,
    editImage,
    setEditImage,
    editGarmentTypeIds,
    setEditGarmentTypeIds,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleEditSubmit,
  };
}
