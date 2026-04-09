"use client";

import { useState, useEffect, useCallback } from "react";
import { PAGE_SIZE } from "../constants/constants";
import type { Admin } from "../types/types";

interface UseAdminListOptions {
  showToast: (type: "success" | "error", message: string) => void;
}

export function useAdminList({ showToast }: UseAdminListOptions) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    const lower = searchTerm.toLowerCase();
    const results = admins.filter(
      (admin) =>
        (admin.name?.toLowerCase() ?? "").includes(lower) ||
        admin.email.toLowerCase().includes(lower)
    );
    setFilteredAdmins(results);
    setPage(1);
  }, [searchTerm, admins]);

  const totalPages = Math.ceil(filteredAdmins.length / PAGE_SIZE);
  const pagedAdmins = filteredAdmins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = useCallback(
    async (id: string) => {
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
    },
    [showToast, fetchAdmins]
  );

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
    confirmDelete,
    setConfirmDelete,
    deleting,
    handleDelete,
    fetchAdmins,
  };
}
