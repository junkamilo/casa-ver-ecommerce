"use client";

import { X, Loader2, ChevronDown, Truck } from "lucide-react";
import { DEPARTAMENTOS } from "@/lib/constants/colombia";
import { SHIPPING_SANTANDER, SHIPPING_NATIONAL } from "@/lib/shipping";
import { AddressFormModalProps } from "../types";
import { FORM_STYLES } from "../constants";
import { useAddressForm } from "../hooks/useAddressForm";
import { FieldError } from "./FieldError";

export function AddressFormModal({ open, editing, submitting, onSave, onClose }: AddressFormModalProps) {
  const {
    register,
    handleSubmit,
    errors,
    deptField,
    cityField,
    selectedDepartment,
    municipios,
    shippingCost,
  } = useAddressForm({ open, editing });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2
            className="text-base font-semibold text-[#154734]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {editing ? "Editar dirección" : "Nueva dirección"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSave)} className="overflow-y-auto p-6 space-y-4">

          {/* Nombre completo */}
          <div className="relative">
            <input type="text" className={FORM_STYLES.input} placeholder=" " {...register("fullName")} />
            <label className={FORM_STYLES.label}>Nombre completo</label>
            <FieldError message={errors.fullName?.message} />
          </div>

          {/* Cédula + Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input type="text" inputMode="numeric" className={FORM_STYLES.input} placeholder=" " {...register("cedula")} />
              <label className={FORM_STYLES.label}>Cédula / NIT</label>
              <FieldError message={errors.cedula?.message} />
            </div>
            <div className="relative">
              <input type="tel" className={FORM_STYLES.input} placeholder=" " {...register("phone")} />
              <label className={FORM_STYLES.label}>Teléfono</label>
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          {/* Dirección */}
          <div className="relative">
            <input type="text" className={FORM_STYLES.input} placeholder=" " {...register("address")} />
            <label className={FORM_STYLES.label}>Dirección (Calle, Carrera…)</label>
            <FieldError message={errors.address?.message} />
          </div>

          {/* Apto */}
          <div className="relative">
            <input type="text" className={FORM_STYLES.input} placeholder=" " {...register("addressDetail")} />
            <label className={FORM_STYLES.label}>Apto / Local (Opcional)</label>
          </div>

          {/* Departamento → Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Departamento */}
            <div className="relative">
              <select
                name={deptField.name}
                ref={deptField.ref}
                value={deptField.value}
                onBlur={deptField.onBlur}
                onChange={(e) => {
                  deptField.onChange(e.target.value);
                  cityField.onChange(""); // limpiar ciudad al cambiar departamento
                }}
                className={FORM_STYLES.select}
              >
                <option value="">Seleccionar</option>
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none">
                Departamento
              </label>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <FieldError message={errors.department?.message} />
            </div>

            {/* Ciudad */}
            <div className="relative">
              <select
                name={cityField.name}
                ref={cityField.ref}
                value={cityField.value}
                onBlur={cityField.onBlur}
                onChange={(e) => cityField.onChange(e.target.value)}
                disabled={!selectedDepartment}
                className={FORM_STYLES.select}
              >
                <option value="">
                  {selectedDepartment ? "Seleccionar ciudad" : "Primero elige departamento"}
                </option>
                {municipios.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none">
                Ciudad / Municipio
              </label>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <FieldError message={errors.city?.message} />
            </div>
          </div>

          {/* Banner costo de envío */}
          {shippingCost > 0 && (
            <div
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
                shippingCost === SHIPPING_SANTANDER
                  ? "bg-[#154734]/5 border-[#154734]/20 text-[#154734]"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              <Truck className={`w-4 h-4 mt-0.5 shrink-0 ${shippingCost === SHIPPING_SANTANDER ? "text-[#154734]" : "text-amber-600"}`} />
              <div>
                {shippingCost === SHIPPING_SANTANDER ? (
                  <>
                    <span className="font-semibold">¡Envío especial disponible!</span> Tus pedidos
                    a esta ciudad tendrán un costo de{" "}
                    <span className="font-bold">${SHIPPING_SANTANDER.toLocaleString("es-CO")}</span>.
                  </>
                ) : (
                  <>
                    Los envíos a esta ciudad tienen un costo de{" "}
                    <span className="font-bold">${SHIPPING_NATIONAL.toLocaleString("es-CO")}</span>.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Código postal */}
          <div className="relative">
            <input type="text" className={FORM_STYLES.input} placeholder=" " {...register("zipCode")} />
            <label className={FORM_STYLES.label}>Código postal (Opcional)</label>
          </div>

          {/* Predeterminada */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" {...register("isDefault")} />
              <div className="w-10 h-5 bg-gray-200 peer-checked:bg-[#154734] rounded-full transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-gray-600 group-hover:text-[#154734] transition-colors">
              Establecer como dirección predeterminada
            </span>
          </label>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#154734] text-white text-sm font-semibold rounded-xl hover:bg-[#1a5c43] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
              ) : editing ? (
                "Guardar cambios"
              ) : (
                "Agregar dirección"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
