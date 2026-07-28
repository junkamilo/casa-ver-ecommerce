"use client";

import { ChevronDown, ChevronUp, Check, Star, Sparkles, Percent, BadgeCheck, Tag, Megaphone } from "lucide-react";
import { GeneralInfoSectionProps } from "../../types";
import { STATUS_OPTIONS, inputCls } from "../../constants";
import { useDropdown } from "../../hooks/useDropdown";
import FieldError from "../shared/FieldError";
import LabelToggle from "./LabelToggle";

export default function GeneralInfoSection({
  name, onName,
  description, onDescription,
  categoryIds, onCategories,
  status, onStatus,
  isFeatured, onFeatured,
  isNew, onNew,
  isProductNew, onProductNew, onProductNewAt,
  isOnSale, onOnSale, onOnSaleAt,
  isSuggested, onSuggested, onSuggestedAt,
  garmentTypes, onGarmentType,
  categories,
  errors = {},
  isSet = false,
}: GeneralInfoSectionProps) {
  const cat = useDropdown();
  const est = useDropdown();
  const gt = useDropdown();

  const selectedCategoryNames = categories
    .filter((c) => categoryIds.includes(c.id))
    .map((c) => c.name);
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];

  const toggleCategory = (id: string) => {
    const next = categoryIds.includes(id)
      ? categoryIds.filter((value) => value !== id)
      : [...categoryIds, id];
    onCategories(next);
  };

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
        {/* ── Categorías ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Categorías *
          </label>
          <div className="relative" ref={cat.ref}>
            <button
              type="button"
              onClick={() => cat.setOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors bg-white ${
                errors.categoryIds
                  ? "border-red-400"
                  : "border-gray-200 hover:border-[#C19A6B]"
              }`}
            >
              <span className={selectedCategoryNames.length > 0 ? "text-gray-800 font-medium truncate" : "text-gray-400"}>
                {selectedCategoryNames.length > 0
                  ? selectedCategoryNames.length === 1
                    ? selectedCategoryNames[0]
                    : `${selectedCategoryNames.length} categorías seleccionadas`
                  : "Seleccionar categorías…"}
              </span>
              {cat.open
                ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>

            {cat.open && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-[#154734]/5 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#154734] uppercase tracking-widest">
                    Categorías
                  </p>
                  {categoryIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onCategories([])}
                      className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-52 p-1.5 space-y-0.5">
                  {categories.map((c) => {
                    const active = categoryIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.id)}
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
                {selectedCategoryNames.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <p className="text-[11px] text-gray-500">
                      {selectedCategoryNames.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <FieldError msg={errors.categoryIds} />
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

      {/* ── Tipos de Prenda (multi-select) ── */}
      {(() => {
        const catGarmentTypes = categories
          .filter((c) => categoryIds.includes(c.id))
          .flatMap((c) => c.garmentTypes)
          .filter((garmentType, index, list) =>
            list.findIndex((item) => item.id === garmentType.id) === index
          );
        const toggle = (id: string) => {
          const next = garmentTypes.includes(id)
            ? garmentTypes.filter((x) => x !== id)
            : [...garmentTypes, id];
          onGarmentType(next);
        };
        const selectedNames = catGarmentTypes
          .filter((g) => garmentTypes.includes(g.id))
          .map((g) => g.name);
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              Tipos de Prenda
              <span className="font-normal text-gray-400 normal-case tracking-normal">(para filtros del menú)</span>
            </label>
            {!categoryIds.length ? (
              <p className="text-[11px] text-gray-400 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                Selecciona al menos una categoría para ver los tipos disponibles.
              </p>
            ) : catGarmentTypes.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-700">
                  Esta categoría no tiene tipos de prenda asignados en las categorías seleccionadas.
                  <a href="/admin/categorias" className="font-bold underline ml-1" target="_blank">Asignar →</a>
                </p>
              </div>
            ) : (
              <div className="relative" ref={gt.ref}>
                <button
                  type="button"
                  onClick={() => gt.setOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-[#C19A6B] text-sm transition-colors bg-white"
                >
                  <span className={selectedNames.length > 0 ? "text-gray-800 font-medium truncate" : "text-gray-400"}>
                    {selectedNames.length > 0
                      ? selectedNames.length === 1
                        ? selectedNames[0]
                        : `${selectedNames.length} tipos seleccionados`
                      : "Sin clasificar…"}
                  </span>
                  {gt.open
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {gt.open && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-[#154734]/5 flex items-center justify-between">
                      <p className="text-[11px] font-bold text-[#154734] uppercase tracking-widest">
                        Tipos de Prenda
                      </p>
                      {garmentTypes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onGarmentType([])}
                          className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-52 p-1.5 space-y-0.5">
                      {catGarmentTypes.map((g) => {
                        const active = garmentTypes.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => toggle(g.id)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              active
                                ? "bg-[#154734] text-white"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="font-medium">{g.name}</span>
                            {active && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {selectedNames.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                        <p className="text-[11px] text-gray-500">
                          {selectedNames.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

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
          <LabelToggle
            active={isSuggested}
            onToggle={handleSuggestedToggle}
            icon={Megaphone}
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
