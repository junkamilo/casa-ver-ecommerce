"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, ChevronDown } from "lucide-react";
import { DEPARTAMENTOS } from "@/lib/constants/colombia";
import type { SavedAddress, AddressFormValues } from "../types";

const schema = z.object({
  fullName: z.string().min(2, "Nombre requerido (mínimo 2 caracteres)"),
  phone: z
    .string()
    .min(7, "Teléfono inválido")
    .regex(/^\d+$/, "Solo números"),
  department: z.string().min(2, "Selecciona un departamento"),
  city: z.string().min(2, "Ciudad requerida"),
  address: z.string().min(5, "Dirección muy corta (mínimo 5 caracteres)"),
  addressDetail: z.string(),
  zipCode: z.string(),
  isDefault: z.boolean(),
});

const fi =
  "peer w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-200 text-sm text-[#154734] pt-6 placeholder-transparent";
const fl =
  "absolute left-4 top-3.5 text-gray-400 text-sm transition-all duration-200 peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-[#C19A6B] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-widest pointer-events-none";

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 text-xs text-red-500 font-medium">{message}</p>
  ) : null;

interface Props {
  open: boolean;
  editing: SavedAddress | null;
  submitting: boolean;
  onSave: (values: AddressFormValues) => Promise<boolean>;
  onClose: () => void;
}

export function AddressFormModal({
  open,
  editing,
  submitting,
  onSave,
  onClose,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      department: "",
      city: "",
      address: "",
      addressDetail: "",
      zipCode: "",
      isDefault: false,
    },
  });

  // Rellenar form al editar
  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          fullName: editing.fullName,
          phone: editing.phone,
          department: editing.department,
          city: editing.city,
          address: editing.address,
          addressDetail: editing.addressDetail ?? "",
          zipCode: editing.zipCode ?? "",
          isDefault: editing.isDefault,
        });
      } else {
        reset({
          fullName: "",
          phone: "",
          department: "",
          city: "",
          address: "",
          addressDetail: "",
          zipCode: "",
          isDefault: false,
        });
      }
    }
  }, [open, editing, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

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
        <form
          onSubmit={handleSubmit(onSave)}
          className="overflow-y-auto p-6 space-y-4"
        >
          {/* Nombre completo */}
          <div className="relative">
            <input
              type="text"
              className={fi}
              placeholder=" "
              {...register("fullName")}
            />
            <label className={fl}>Nombre completo</label>
            <FieldError message={errors.fullName?.message} />
          </div>

          {/* Teléfono */}
          <div className="relative">
            <input
              type="tel"
              className={fi}
              placeholder=" "
              {...register("phone")}
            />
            <label className={fl}>Teléfono</label>
            <FieldError message={errors.phone?.message} />
          </div>

          {/* Dirección */}
          <div className="relative">
            <input
              type="text"
              className={fi}
              placeholder=" "
              {...register("address")}
            />
            <label className={fl}>Dirección (Calle, Carrera…)</label>
            <FieldError message={errors.address?.message} />
          </div>

          {/* Apto + Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                className={fi}
                placeholder=" "
                {...register("addressDetail")}
              />
              <label className={fl}>Apto / Local (Opcional)</label>
            </div>
            <div className="relative">
              <input
                type="text"
                className={fi}
                placeholder=" "
                {...register("city")}
              />
              <label className={fl}>Ciudad</label>
              <FieldError message={errors.city?.message} />
            </div>
          </div>

          {/* Departamento + Código postal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <select
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none text-[#154734] outline-none focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all duration-200 text-sm cursor-pointer pt-6"
                {...register("department")}
              >
                <option value="">Seleccionar</option>
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none">
                Departamento
              </label>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <FieldError message={errors.department?.message} />
            </div>

            <div className="relative">
              <input
                type="text"
                className={fi}
                placeholder=" "
                {...register("zipCode")}
              />
              <label className={fl}>Código postal (Opcional)</label>
            </div>
          </div>

          {/* Predeterminada */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register("isDefault")}
              />
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
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando…
                </>
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
