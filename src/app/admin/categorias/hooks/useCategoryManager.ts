"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TOAST_DURATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../constants/constants";
import type { Category, ToastState } from "../types/types";

export function useCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  // Edit modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editBannerImage, setEditBannerImage] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      showToast("error", ERROR_MESSAGES.load);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, image, bannerImage }),
      });

      if (!res.ok) {
        if (res.status === 409) throw new Error(ERROR_MESSAGES.duplicate);
        throw new Error(ERROR_MESSAGES.create);
      }

      showToast("success", SUCCESS_MESSAGES.created);
      setShowModal(false);
      setName("");
      setDescription("");
      setImage("");
      setBannerImage("");
      fetchCategories();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || "");
    setEditImage(category.image || "");
    setEditBannerImage(category.bannerImage || "");
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setEditName("");
    setEditDescription("");
    setEditImage("");
    setEditBannerImage("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          image: editImage,
          bannerImage: editBannerImage,
        }),
      });

      if (!res.ok) {
        if (res.status === 409) throw new Error(ERROR_MESSAGES.duplicate);
        throw new Error(ERROR_MESSAGES.edit);
      }

      showToast("success", SUCCESS_MESSAGES.updated);
      closeEditModal();
      fetchCategories();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const res = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });

      if (res.status === 409) {
        const data = await res.json();
        showToast(
          "error",
          `No se puede ocultar esta categoría. Hay ${data.count} producto${data.count === 1 ? "" : "s"} asociado${data.count === 1 ? "" : "s"} a "${data.name}". Reasigna u oculta esos productos primero.`
        );
        return;
      }

      if (!res.ok) throw new Error(ERROR_MESSAGES.toggle);

      showToast(
        "success",
        category.isActive ? SUCCESS_MESSAGES.deactivated : SUCCESS_MESSAGES.activated
      );
      fetchCategories();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    }
  };

  return {
    categories,
    filtered,
    loading,
    search,
    setSearch,
    showModal,
    setShowModal,
    submitting,
    name,
    setName,
    description,
    setDescription,
    image,
    setImage,
    bannerImage,
    setBannerImage,
    toast,
    setToast,
    handleSubmit,
    editingCategory,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    editImage,
    setEditImage,
    editBannerImage,
    setEditBannerImage,
    editSubmitting,
    openEditModal,
    closeEditModal,
    handleEditSubmit,
    handleToggleActive,
  };
}
