"use client";

import { X, Loader2, Palette } from "lucide-react";
import { SUGGESTED_COLORS } from "../constants";
import type { ColorModalProps } from "../types/types";

const ColorModal = ({
  isOpen,
  onClose,
  submitting,
  onSubmit,
  name,
  setName,
  hexCode,
  setHexCode,
  mode = "create",
}: ColorModalProps) => {
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
              <Palette className="w-4 h-4 text-[#154734]" />
            </div>
            <h2
              className="text-xl text-[#154734] italic"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {mode === "edit" ? "Editar Color" : "Nuevo Color"}
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

        <form onSubmit={onSubmit} className="p-7 space-y-5">
          {/* Vista previa */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div
              className="w-14 h-14 rounded-xl border-2 border-white shadow-md shrink-0 transition-colors"
              style={{ backgroundColor: hexCode }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-700">{name || "Vista previa"}</p>
              <p className="text-xs text-gray-400 font-mono">{hexCode}</p>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">
              Nombre del Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Verde Militar, Azul Navy, Beige..."
              required
              autoFocus
              maxLength={60}
              className="w-full px-4 py-3 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-[#154734] font-medium text-sm"
            />
          </div>

          {/* Color hex */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">
              Código de Color <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-1 bg-white shrink-0"
                title="Seleccionar color"
              />
              <input
                type="text"
                value={hexCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setHexCode(val);
                }}
                placeholder="#000000"
                maxLength={7}
                className="flex-1 px-4 py-3 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all font-mono text-sm"
              />
            </div>
          </div>

          {/* Colores sugeridos */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Colores sugeridos
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setHexCode(c)}
                  title={c}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    hexCode.toLowerCase() === c.toLowerCase()
                      ? "border-[#154734] scale-110 shadow-md"
                      : "border-white shadow-sm"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              {mode === "edit" ? "Guardar Cambios" : "Crear Color"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ColorModal;
