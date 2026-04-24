"use client";

import { useState, useEffect, useCallback } from "react";
import { PAGE_SIZE } from "../constants/constants";
import type { Admin } from "../types/types";
import {
  AdminUsersApiError,
  fetchAdminUsers,
  revokeAdminUser,
} from "@/modules/adminCatalog/users/presentation/api-client";
import { mapAdminUserListDtoToUi } from "@/modules/adminCatalog/users/presentation/mappers";

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
      const data = await fetchAdminUsers();
      const mapped = mapAdminUserListDtoToUi(data);
      setAdmins(mapped);
      setFilteredAdmins(mapped);
    } catch (error: unknown) {
      if (error instanceof AdminUsersApiError) {
        showToast("error", error.message);
        return;
      }
      showToast("error", "Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Resetea a página 1 solo cuando el usuario cambia la búsqueda, no cuando se recargan datos
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const results = admins.filter(
      (admin) =>
        (admin.name?.toLowerCase() ?? "").includes(lower) ||
        admin.email.toLowerCase().includes(lower)
    );
    setFilteredAdmins(results);
  }, [searchTerm, admins]);

  const totalPages = Math.ceil(filteredAdmins.length / PAGE_SIZE);
  const pagedAdmins = filteredAdmins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeleting(true);
      try {
        await revokeAdminUser(id);
        showToast("success", "Acceso de administrador revocado");
        setConfirmDelete(null);
        fetchAdmins();
      } catch (error: unknown) {
        if (error instanceof AdminUsersApiError) {
          showToast("error", error.message);
          return;
        }
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
