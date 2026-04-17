"use client";

import { useState, useEffect, useCallback } from "react";
import { SavedAddress, AddressFormValues, UseAddressesResult } from "../types";

export function useAddresses(): UseAddressesResult {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/profile/addresses");
      if (!res.ok) throw new Error("Error al cargar direcciones");
      const data = await res.json();
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  function openCreate() {
    setEditingAddress(null);
    setModalOpen(true);
  }

  function openEdit(address: SavedAddress) {
    setEditingAddress(address);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingAddress(null);
  }

  async function saveAddress(values: AddressFormValues): Promise<{ ok: boolean; error?: string }> {
    setSubmitting(true);
    try {
      const url = editingAddress
        ? `/api/profile/addresses/${editingAddress.id}`
        : "/api/profile/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          cedula: values.cedula || undefined,
          addressDetail: values.addressDetail || undefined,
          zipCode: values.zipCode || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: false, error: data.message ?? "Error al guardar la dirección" };
      }

      await fetchAddresses();
      closeModal();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Error al guardar" };
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteAddress(id: string): Promise<boolean> {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Error al eliminar la dirección");
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function setDefault(id: string): Promise<boolean> {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/profile/addresses/${id}/default`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Error al actualizar dirección predeterminada");
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    addresses,
    loading,
    error,
    modalOpen,
    editingAddress,
    openCreate,
    openEdit,
    closeModal,
    saveAddress,
    deleteAddress,
    setDefault,
    submitting,
  };
}
