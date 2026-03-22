"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import type { SavedAddress } from "../types";

interface Props {
  address: SavedAddress;
  onEdit: (address: SavedAddress) => void;
  onDelete: (id: string) => Promise<boolean>;
  onSetDefault: (id: string) => Promise<boolean>;
  disabled?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  disabled,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState<
    "delete" | "default" | null
  >(null);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setActionLoading("delete");
    await onDelete(address.id);
    setActionLoading(null);
    setConfirmDelete(false);
  }

  async function handleSetDefault() {
    setActionLoading("default");
    await onSetDefault(address.id);
    setActionLoading(null);
  }

  const isLoading = actionLoading !== null || disabled;

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 p-5 group ${
        address.isDefault
          ? "border-[#154734]/30 shadow-[0_0_0_1px_#154734]/10 shadow-md"
          : "border-gray-100 shadow-sm hover:border-[#C19A6B]/40 hover:shadow-md"
      }`}
    >
      {/* Predeterminada badge */}
      {address.isDefault && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#154734] bg-[#154734]/10 px-2.5 py-1 rounded-full">
          <Star className="w-2.5 h-2.5 fill-[#154734]" />
          Predeterminada
        </span>
      )}

      {/* Contenido */}
      <div className="flex items-start gap-3 pr-28">
        <div className="p-2 rounded-xl bg-[#154734]/8 shrink-0 mt-0.5">
          <MapPin className="w-4 h-4 text-[#154734]" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#154734] text-sm leading-tight">
            {address.fullName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{address.phone}</p>
          <p className="text-xs text-gray-700 mt-2 leading-relaxed">
            {address.address}
            {address.addressDetail ? `, ${address.addressDetail}` : ""}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {address.city}, {address.department}
            {address.zipCode ? ` · CP ${address.zipCode}` : ""}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
        {/* Establecer como predeterminada */}
        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#154734] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === "default" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Star className="w-3.5 h-3.5" />
            )}
            Establecer predeterminada
          </button>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Editar */}
          <button
            onClick={() => onEdit(address)}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-[#154734] hover:bg-[#154734]/8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Eliminar */}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isLoading}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === "delete" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
