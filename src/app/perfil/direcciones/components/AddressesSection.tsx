"use client";

import { MapPin, Plus, Loader2, AlertCircle } from "lucide-react";
import { useAddresses } from "../hooks/useAddresses";
import { MAX_ADDRESSES } from "../constants";
import { AddressCard } from "./AddressCard";
import { AddressEmptyState } from "./AddressEmptyState";
import { AddressFormModal } from "./AddressFormModal";

export function AddressesSection() {
  const {
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
  } = useAddresses();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#154734]/8">
            <MapPin className="w-5 h-5 text-[#154734]" />
          </div>
          <div>
            <h2
              className="text-base font-semibold text-[#154734]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Mis Direcciones
            </h2>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {addresses.length} de {MAX_ADDRESSES} direcciones guardadas
              </p>
            )}
          </div>
        </div>

        {!loading && addresses.length < MAX_ADDRESSES && (
          <button
            onClick={openCreate}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#154734] text-white text-xs font-semibold rounded-xl hover:bg-[#1a5c43] active:scale-95 transition-all duration-200 disabled:opacity-60 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Error global */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-[#154734]/40" />
          </div>
        ) : addresses.length === 0 ? (
          <AddressEmptyState onAdd={openCreate} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={openEdit}
                onDelete={deleteAddress}
                onSetDefault={setDefault}
                disabled={submitting}
              />
            ))}
          </div>
        )}

        {/* Límite alcanzado */}
        {!loading && addresses.length >= MAX_ADDRESSES && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Alcanzaste el límite de {MAX_ADDRESSES} direcciones. Elimina una
            para agregar otra.
          </p>
        )}
      </div>

      {/* Modal */}
      <AddressFormModal
        open={modalOpen}
        editing={editingAddress}
        submitting={submitting}
        onSave={saveAddress}
        onClose={closeModal}
      />
    </div>
  );
}
