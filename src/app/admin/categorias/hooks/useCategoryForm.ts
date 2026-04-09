"use client";

import { useState, useCallback } from "react";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type { Category } from "../types/types";

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

  // ── Estado: modal editar ──────────────────────────────────────────────────
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ── Crear ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: { preventDefault(): void }) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, image }),
        });

        if (!res.ok) {
          if (res.status === 409) throw new Error(ERROR_MESSAGES.duplicate);
          throw new Error(ERROR_MESSAGES.create);
        }

        showToast("success", SUCCESS_MESSAGES.created);
        setShowModal(false);
        setName("");
        setImage("");
        onSuccess();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
      } finally {
        setSubmitting(false);
      }
    },
    [name, image, showToast, onSuccess]
  );

  // ── Editar ────────────────────────────────────────────────────────────────

  const openEditModal = useCallback((category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditImage(category.image ?? "");
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingCategory(null);
    setEditName("");
    setEditImage("");
  }, []);

  const handleEditSubmit = useCallback(
    async (e: { preventDefault(): void }) => {
      e.preventDefault();
      if (!editingCategory) return;
      setEditSubmitting(true);
      try {
        const res = await fetch(`/api/admin/categories?id=${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editName, image: editImage }),
        });

        if (!res.ok) {
          if (res.status === 409) throw new Error(ERROR_MESSAGES.duplicate);
          throw new Error(ERROR_MESSAGES.edit);
        }

        showToast("success", SUCCESS_MESSAGES.updated);
        closeEditModal();
        onSuccess();
      } catch (err: unknown) {
        showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
      } finally {
        setEditSubmitting(false);
      }
    },
    [editingCategory, editName, editImage, showToast, closeEditModal, onSuccess]
  );

  return {
    showModal,
    setShowModal,
    submitting,
    name,
    setName,
    image,
    setImage,
    handleSubmit,
    editingCategory,
    editName,
    setEditName,
    editImage,
    setEditImage,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleEditSubmit,
  };
}
