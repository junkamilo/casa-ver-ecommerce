"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TOAST_DURATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DELETE_CONFIRM_MSG,
} from "../constants/constants";
import type { Category, ToastState } from "../types/types";

export function useCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        if (res.status === 409) throw new Error(ERROR_MESSAGES.duplicate);
        throw new Error(ERROR_MESSAGES.create);
      }

      showToast("success", SUCCESS_MESSAGES.created);
      setShowModal(false);
      setName("");
      setDescription("");
      fetchCategories();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : ERROR_MESSAGES.unknown);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(DELETE_CONFIRM_MSG)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", SUCCESS_MESSAGES.deleted);
        fetchCategories();
      } else {
        throw new Error();
      }
    } catch {
      showToast("error", ERROR_MESSAGES.delete);
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
    toast,
    setToast,
    handleSubmit,
    handleDelete,
  };
}
