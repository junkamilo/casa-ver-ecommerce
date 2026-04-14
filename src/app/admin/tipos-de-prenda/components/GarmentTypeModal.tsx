"use client";

import { X, Loader2, Tag } from "lucide-react";
import type { GarmentTypeModalProps } from "../types/types";

const GarmentTypeModal = ({
  isOpen,
  onClose,
  submitting,
  onSubmit,
  name,
  setName,
  mode = "create",
}: GarmentTypeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#154734]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#154734]/10 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-[#154734]" />
            </div>
            <h2
              className="text-xl text-[#154734] italic"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {mode === "edit" ? "Editar Tipo" : "Nuevo Tipo de Prenda"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:text-[#C19A6B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-7 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">
              Nombre del Tipo de Prenda
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Pantalón, Short, Blusa, Vestido..."
              required
              autoFocus
              className="w-full px-4 py-3 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-[#154734] font-medium text-sm"
            />
            <p className="text-[11px] text-gray-400">
              Se generará un identificador único automáticamente (ej: &quot;pantalon&quot;).
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-white bg-[#154734] hover:bg-[#103a2a] rounded-xl shadow flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "edit" ? "Guardar Cambios" : "Crear Tipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GarmentTypeModal;
