"use client";

import { ChevronDown, ChevronUp, Check, BadgeCheck, Tag } from "lucide-react";
import {
  BadgePercent,
  FlameIcon,
  LightbulbIcon,
  PackageOpen,
  SparklesIcon,
} from "@/components/icons";
import { GeneralInfoSectionProps } from "../../types";
import { STATUS_OPTIONS, inputCls } from "../../constants";
import { useDropdown } from "../../hooks/useDropdown";
import FieldError from "../shared/FieldError";
import LabelToggle from "./LabelToggle";

export default function GeneralInfoSection({
  name, onName,
  description, onDescription,
  status, onStatus,
  isFeatured, onFeatured,
  isNew, onNew,
  isProductNew, onProductNew, onProductNewAt,
  isOnSale, onOnSale, onOnSaleAt,
  isSuggested, onSuggested, onSuggestedAt,
  errors = {},
  isSet = false,
}: GeneralInfoSectionProps) {
  const { open: estOpen, setOpen: setEstOpen, ref: estRef } = useDropdown();

  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];

  const handleProductNewToggle = () => {
    const next = !isProductNew;
    onProductNew(next);
    onProductNewAt(next ? new Date().toISOString() : null);
  };

  const handleOnSaleToggle = () => {
    const next = !isOnSale;
    onOnSale(next);
    onOnSaleAt(next ? new Date().toISOString() : null);
  };

  const handleSuggestedToggle = () => {
    const next = !isSuggested;
    onSuggested(next);
    onSuggestedAt(next ? new Date().toISOString() : null);
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
          rows={5}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder={
            isSet
              ? "Descripción general del conjunto (opcional). Cada línea se mostrará como viñeta en la tienda."
              : "Describe el producto. Cada salto de línea se mostrará como viñeta en la ficha del producto."
          }
          className={`${inputCls(!!errors.description)} resize-y min-h-[120px]`}
        />
        <p className="text-[11px] text-gray-400">
          Tip: escribe cada característica en una línea nueva para que aparezca con viñeta dorada.
        </p>
        <FieldError msg={errors.description} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Categorías: las asigna el POS ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Categorías
          </label>
          <p className="flex items-start gap-2 px-4 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-[11px] text-gray-500">
            <Tag className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
            Las categorías, subcategorías y tipos de prenda se crean y asignan en el POS (Tienda → Categorías).
          </p>
        </div>

        {/* ── Estado ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Estado
          </label>
          <div className="relative" ref={estRef}>
            <button
              type="button"
              onClick={() => setEstOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-[#C19A6B] text-sm transition-colors bg-white"
            >
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedStatus.dot}`} />
                <span className="text-gray-800 font-medium">{selectedStatus.label}</span>
              </span>
              {estOpen
                ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>

            {estOpen && (
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
                        onClick={() => { onStatus(opt.value); setEstOpen(false); }}
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
            icon={FlameIcon}
            label="Más Vendidos"
            description="Aparece en sección Más Vendidos"
            activeColor="text-amber-600"
            activeBg="bg-amber-50"
            activeBorder="border-amber-400"
          />
          <LabelToggle
            active={isNew}
            onToggle={() => onNew(!isNew)}
            icon={PackageOpen}
            label="Nuevos Ingresos"
            description="Aparece en Nueva Colección"
            activeColor="text-[#154734]"
            activeBg="bg-[#154734]/5"
            activeBorder="border-[#154734]"
          />
          <LabelToggle
            active={isProductNew}
            onToggle={handleProductNewToggle}
            icon={SparklesIcon}
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
            icon={BadgePercent}
            label="Producto en Oferta"
            description="Muestra etiqueta dorada de oferta"
            infoText="Etiqueta de oferta activa"
            activeColor="text-[#C19A6B]"
            activeBg="bg-[#C19A6B]/10"
            activeBorder="border-[#C19A6B]"
          />
          <LabelToggle
            active={isSuggested}
            onToggle={handleSuggestedToggle}
            icon={LightbulbIcon}
            label="Sugerir en popup"
            description="Aparece en 'Te podría interesar'"
            infoText="Sugerencia activa en popup"
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
