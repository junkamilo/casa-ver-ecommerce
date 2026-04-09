"use client";

import { useState } from "react";
import { UseAddressCardOptions, UseAddressCardResult } from "../types";

export function useAddressCard({
  addressId,
  onDelete,
  onSetDefault,
}: UseAddressCardOptions): UseAddressCardResult {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState<"delete" | "default" | null>(null);

  const isLoading = actionLoading !== null;

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setActionLoading("delete");
    await onDelete(addressId);
    setActionLoading(null);
    setConfirmDelete(false);
  }

  async function handleSetDefault() {
    setActionLoading("default");
    await onSetDefault(addressId);
    setActionLoading(null);
  }

  const cancelDelete = () => setConfirmDelete(false);

  return {
    confirmDelete,
    actionLoading,
    isLoading,
    handleDelete,
    handleSetDefault,
    cancelDelete,
  };
}
