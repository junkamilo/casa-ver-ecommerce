"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { Category } from "../../types";
import { ProductFormErrors } from "../../schema";

interface Props {
  name: string; onName: (v: string) => void;
  description: string; onDescription: (v: string) => void;
  categoryId: string; onCategory: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  isFeatured: boolean; onFeatured: (v: boolean) => void;
  isNew: boolean; onNew: (v: boolean) => void;
  categories: Category[];
  errors?: ProductFormErrors;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE",   label: "Activo",    dot: "bg-emerald-500" },
  { value: "INACTIVE", label: "Inactivo",  dot: "bg-gray-400"    },
];

const inputCls = (hasError = false) =>
  `w-full px-4 py-2.5 rounded-lg border ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#C19A6B] focus:ring-[#C19A6B]/10"
  } focus:ring-4 outline-none text-sm transition-colors`;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-sm mt-1">{msg}</p>;
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return { open, setOpen, ref };
}

export default function GeneralInfoSection({
  name, onName,
  description, onDescription,
  categoryId, onCategory,
  status, onStatus,
  isFeatured, onFeatured,
  isNew, onNew,
  categories,
  errors = {},
}: Props) {
  const cat = useDropdown();
  const est = useDropdown();

  const selectedCat = categories.find((c) => c.id === categoryId);
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];

  return (
    <div className="space-y-4">
      {/* Nombre */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Nombre del Producto *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Ej: Conjunto Lino Premium"
          className={inputCls(!!errors.name)}
        />
        <FieldError msg={errors.name} />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Descripción *
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder="Describe el producto..."
          className={`${inputCls(!!errors.description)} resize-none`}
        />
        <FieldError msg={errors.description} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Categoría ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Categoría *
          </label>
          <div className="relative" ref={cat.ref}>
            <button
              type="button"
              onClick={() => cat.setOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors bg-white ${
                errors.categoryId
                  ? "border-red-400"
                  : "border-gray-200 hover:border-[#C19A6B]"
              }`}
            >
              <span className={selectedCat ? "text-gray-800" : "text-gray-400"}>
                {selectedCat ? selectedCat.name : "Seleccionar categoría…"}
              </span>
              {cat.open
                ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>

            {cat.open && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {/* Header del panel */}
                <div className="px-4 py-2.5 border-b border-gray-100 bg-[#154734]/5">
                  <p className="text-[11px] font-bold text-[#154734] uppercase tracking-widest">
                    Categorías
                  </p>
                </div>
                <div className="overflow-y-auto max-h-52 p-1.5 space-y-0.5">
                  {categories.map((c) => {
                    const active = c.id === categoryId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { onCategory(c.id); cat.setOpen(false); }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          active
                            ? "bg-[#154734] text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-medium">{c.name}</span>
                        {active && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <FieldError msg={errors.categoryId} />
        </div>

        {/* ── Estado ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Estado
          </label>
          <div className="relative" ref={est.ref}>
            <button
              type="button"
              onClick={() => est.setOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-[#C19A6B] text-sm transition-colors bg-white"
            >
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedStatus.dot}`} />
                <span className="text-gray-800 font-medium">{selectedStatus.label}</span>
              </span>
              {est.open
                ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>

            {est.open && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-[#154734]/5">
                  <p className="text-[11px] font-bold text-[#154734] uppercase tracking-widest">
                    Estado del producto
                  </p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = opt.value === status;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { onStatus(opt.value); est.setOpen(false); }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          active
                            ? "bg-[#154734]/8 text-[#154734]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                          <span className="font-medium">{opt.label}</span>
                        </span>
                        {active && <Check className="w-4 h-4 text-[#154734] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-6 pt-1">
        {[
          { label: "Producto Destacado", value: isFeatured, onChange: onFeatured },
          { label: "Marcar como Nuevo",  value: isNew,      onChange: onNew      },
        ].map(({ label, value, onChange }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#154734] focus:ring-[#154734] accent-[#154734]"
            />
            <span className="text-sm text-gray-600">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
