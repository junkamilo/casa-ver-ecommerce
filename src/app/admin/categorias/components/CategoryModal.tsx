"use client";

import { X, Loader2, ImageIcon, Tag, Check } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import type { CategoryModalProps } from "../types/types";

const CategoryModal = ({
  isOpen,
  onClose,
  submitting,
  onSubmit,
  name,
  setName,
  image,
  setImage,
  garmentTypeIds,
  setGarmentTypeIds,
  allGarmentTypes,
  mode = "create",
}: CategoryModalProps) => {
  if (!isOpen) return null;

  const toggleGarmentType = (id: string) => {
    setGarmentTypeIds(
      garmentTypeIds.includes(id)
        ? garmentTypeIds.filter((i) => i !== id)
        : [...garmentTypeIds, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#154734]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFA]">
          <h2
            className="text-2xl text-[#154734] italic"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {mode === "edit" ? "Editar Colección" : "Nueva Colección"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:text-[#C19A6B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-8 space-y-8 max-h-[75vh] overflow-y-auto"
        >
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">
              Nombre de la Colección
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Prendas Inferiores"
              required
              className="w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-[#154734] font-medium"
            />
          </div>

          {/* Tipos de Prenda */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-[#154734] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C19A6B]" />
              Tipos de Prenda
              <span className="font-light normal-case tracking-normal text-gray-400">
                (opcional — define qué tipos aparecen al crear productos)
              </span>
            </label>
            <p className="text-[11px] text-gray-400 font-light leading-relaxed">
              Selecciona los tipos de prenda que pertenecen a esta categoría.
              Al crear un producto en esta categoría, solo verás estos tipos.
            </p>

            {allGarmentTypes.length === 0 ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">
                  No hay tipos de prenda creados.
                  <a href="/admin/tipos-de-prenda" className="font-bold underline ml-1" target="_blank">
                    Crear tipos de prenda →
                  </a>
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allGarmentTypes.map((gt) => {
                  const selected = garmentTypeIds.includes(gt.id);
                  return (
                    <button
                      key={gt.id}
                      type="button"
                      onClick={() => toggleGarmentType(gt.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selected
                          ? "bg-[#154734] text-white border-[#154734] shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#154734] hover:text-[#154734]"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      {gt.name}
                    </button>
                  );
                })}
              </div>
            )}

            {garmentTypeIds.length > 0 && (
              <p className="text-[11px] text-[#154734] font-medium">
                {garmentTypeIds.length} tipo{garmentTypeIds.length !== 1 ? "s" : ""} seleccionado{garmentTypeIds.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Imagen */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-[#154734] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#C19A6B]" />
              Foto de la Tarjeta{" "}
              <span className="font-light normal-case tracking-normal text-gray-400">
                (opcional)
              </span>
            </label>
            <p className="text-[11px] text-gray-400 font-light leading-relaxed">
              Si no se sube foto, la tarjeta mostrará el nombre de la colección sobre fondo verde.
            </p>
            <ImageUpload
              value={image ? [image] : []}
              disabled={submitting}
              onChange={(urls) => setImage(urls[0] ?? "")}
              onRemove={() => setImage("")}
              maxImages={1}
            />
          </div>

          {/* Acciones */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-[#154734] hover:bg-[#103a2a] rounded-xl shadow-lg hover:shadow-[#154734]/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "edit" ? "Guardar Cambios" : "Crear Colección"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
