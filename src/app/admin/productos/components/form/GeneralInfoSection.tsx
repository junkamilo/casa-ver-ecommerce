"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Check, Star, Sparkles, Tag, Percent, BadgeCheck } from "lucide-react";
import { Category } from "../../types";
import { ProductFormErrors } from "../../schema";

interface Props {
  name: string; onName: (v: string) => void;
  description: string; onDescription: (v: string) => void;
  categoryId: string; onCategory: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  isFeatured: boolean; onFeatured: (v: boolean) => void;
  isNew: boolean; onNew: (v: boolean) => void;
  isProductNew: boolean; onProductNew: (v: boolean) => void;
  isProductNewAt: string | null; onProductNewAt: (v: string | null) => void;
  isOnSale: boolean; onOnSale: (v: boolean) => void;
  isOnSaleAt: string | null; onOnSaleAt: (v: string | null) => void;
  categories: Category[];
  errors?: ProductFormErrors;
  isSet?: boolean;
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

interface LabelToggleProps {
  active: boolean;
  onToggle: () => void;
  icon: React.ElementType;
  label: string;
  description: string;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  infoText?: string;
}

function LabelToggle({ active, onToggle, icon: Icon, label, description, activeColor, activeBg, activeBorder, infoText }: LabelToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center justify-between gap-3 w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 text-left ${
        active
          ? `${activeBorder} ${activeBg}`
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? activeBg : "bg-gray-100"}`}>
          <Icon className={`w-4 h-4 ${active ? activeColor : "text-gray-400"}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-bold uppercase tracking-wide ${active ? activeColor : "text-gray-500"}`}>
            {label}
          </p>
          <p className="text-[10px] text-gray-400 truncate">{active && infoText ? infoText : description}</p>
        </div>
      </div>
      <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        active ? "bg-current" : "bg-gray-300"
      }`} style={{ color: active ? undefined : undefined }}>
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${active ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </button>
  );
}

export default function GeneralInfoSection({
  name, onName,
  description, onDescription,
  categoryId, onCategory,
  status, onStatus,
  isFeatured, onFeatured,
  isNew, onNew,
  isProductNew, onProductNew, onProductNewAt,
  isOnSale, onOnSale, onOnSaleAt,
  categories,
  errors = {},
  isSet = false,
}: Props) {
  const cat = useDropdown();
  const est = useDropdown();

  const selectedCat = categories.find((c) => c.id === categoryId);
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];

  const handleProductNewToggle = () => {
    const next = !isProductNew;
    onProductNew(next);
    // Al activar, guardar timestamp actual; al desactivar, limpiar
    onProductNewAt(next ? new Date().toISOString() : null);
  };

  const handleOnSaleToggle = () => {
    const next = !isOnSale;
    onOnSale(next);
    onOnSaleAt(next ? new Date().toISOString() : null);
  };

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
          Descripción{" "}
          {isSet
            ? <span className="font-normal text-gray-400 normal-case tracking-normal">(opcional para conjuntos)</span>
            : <span className="text-red-500">*</span>}
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder={isSet ? "Descripción general del conjunto (opcional)..." : "Describe el producto..."}
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

      {/* ── Etiquetas / Colecciones ── */}
      <div className="space-y-2.5 pt-1">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Colecciones y Etiquetas
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <LabelToggle
            active={isFeatured}
            onToggle={() => onFeatured(!isFeatured)}
            icon={Star}
            label="Más Vendidos"
            description="Aparece en sección Más Vendidos"
            activeColor="text-amber-600"
            activeBg="bg-amber-50"
            activeBorder="border-amber-400"
          />
          <LabelToggle
            active={isNew}
            onToggle={() => onNew(!isNew)}
            icon={Sparkles}
            label="Nuevos Ingresos"
            description="Aparece en Nueva Colección"
            activeColor="text-[#154734]"
            activeBg="bg-[#154734]/5"
            activeBorder="border-[#154734]"
          />
          <LabelToggle
            active={isProductNew}
            onToggle={handleProductNewToggle}
            icon={BadgeCheck}
            label="Producto Nuevo"
            description="Muestra etiqueta roja · dura 7 días"
            infoText="Etiqueta activa · expira en 7 días"
            activeColor="text-red-600"
            activeBg="bg-red-50"
            activeBorder="border-red-400"
          />
          <LabelToggle
            active={isOnSale}
            onToggle={handleOnSaleToggle}
            icon={Percent}
            label="Producto en Oferta"
            description="Muestra etiqueta dorada de oferta"
            infoText="Etiqueta de oferta activa"
            activeColor="text-[#C19A6B]"
            activeBg="bg-[#C19A6B]/10"
            activeBorder="border-[#C19A6B]"
          />
        </div>

        {/* Vista previa de etiqueta activa */}
        {(isProductNew || isOnSale) && (
          <div className="flex items-center gap-2 pt-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Vista previa etiqueta:</p>
            {isProductNew && isOnSale ? (
              <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] bg-[#154734] text-white shadow-sm">
                Nuevo y en Oferta
              </span>
            ) : isProductNew ? (
              <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] bg-red-600 text-white shadow-sm">
                Nuevo Producto
              </span>
            ) : (
              <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] bg-[#C19A6B] text-white shadow-sm">
                En Oferta
              </span>
            )}
          </div>
        )}
      </div>

      {/* Nota informativa sobre expiración */}
      {isProductNew && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <BadgeCheck className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-red-600 leading-relaxed">
            La etiqueta <strong>Nuevo Producto</strong> se mostrará durante 7 días desde su activación.
            Puedes desactivarla manualmente desde edición en cualquier momento.
            {isOnSale && " La etiqueta se verá combinada como «Nuevo y en Oferta»."}
          </p>
        </div>
      )}
    </div>
  );
}
