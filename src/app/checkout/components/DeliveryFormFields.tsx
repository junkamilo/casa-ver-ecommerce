"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useFormContext, useController } from "react-hook-form";
import { getDepartamentos, getMunicipiosForDepartment } from "@/lib/constants/colombia";
import { INPUT_CLS, LABEL_CLS } from "../constants";
import type { CheckoutFormData } from "../types/schema";
import CustomSelect from "./CustomSelect";

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{message}</p>
  ) : null;

/**
 * Campos del formulario de envío — sin wrapper de sección.
 * Reutilizado por DeliverySection (guest) y AuthenticatedDelivery (modo manual).
 */
export function DeliveryFormFields() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  const { field: deptField } = useController<CheckoutFormData, "department">({
    name: "department",
  });
  const { field: cityField } = useController<CheckoutFormData, "city">({
    name: "city",
  });

  const selectedDepartment = deptField.value;

  // Limpiar ciudad cuando el departamento CAMBIA (no en el primer render)
  const prevDeptRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevDeptRef.current !== undefined && prevDeptRef.current !== selectedDepartment) {
      setValue("city", "", { shouldValidate: false });
    }
    prevDeptRef.current = selectedDepartment;
  }, [selectedDepartment, setValue]);

  const municipios = selectedDepartment
    ? getMunicipiosForDepartment(selectedDepartment)
    : [];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* País — fijo Colombia */}
      <div className="relative">
        <select
          aria-label="País"
          className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-200 rounded-xl appearance-none text-[#154734] font-medium outline-none focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all duration-300 text-sm shadow-inner cursor-pointer pt-6"
          defaultValue="CO"
          disabled
        >
          <option value="CO">Colombia</option>
        </select>
        <label className="absolute left-5 top-2 text-[10px] font-bold uppercase tracking-widest text-[#C19A6B] pointer-events-none">
          País / Región
        </label>
        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C19A6B] pointer-events-none" />
      </div>

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="relative">
          <input
            type="text"
            id="firstName"
            autoComplete="given-name"
            className={INPUT_CLS}
            placeholder=" "
            {...register("firstName")}
          />
          <label htmlFor="firstName" className={LABEL_CLS}>
            Nombre
          </label>
          <FieldError message={errors.firstName?.message} />
        </div>
        <div className="relative">
          <input
            type="text"
            id="lastName"
            autoComplete="family-name"
            className={INPUT_CLS}
            placeholder=" "
            {...register("lastName")}
          />
          <label htmlFor="lastName" className={LABEL_CLS}>
            Apellidos
          </label>
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>

      {/* Cédula / NIT */}
      <div className="relative">
        <input
          type="text"
          id="cedula"
          inputMode="numeric"
          autoComplete="off"
          maxLength={12}
          className={INPUT_CLS}
          placeholder=" "
          {...register("cedula")}
        />
        <label htmlFor="cedula" className={LABEL_CLS}>
          Cédula / NIT
        </label>
        <FieldError message={errors.cedula?.message} />
      </div>

      {/* Dirección */}
      <div className="relative">
        <input
          type="text"
          id="address"
          autoComplete="street-address"
          className={INPUT_CLS}
          placeholder=" "
          {...register("address")}
        />
        <label htmlFor="address" className={LABEL_CLS}>
          Dirección (Calle, Carrera…)
        </label>
        <FieldError message={errors.address?.message} />
      </div>

      {/* Apto / Local */}
      <div className="relative">
        <input
          type="text"
          id="addressDetail"
          autoComplete="address-line2"
          maxLength={100}
          className={INPUT_CLS}
          placeholder=" "
          {...register("addressDetail")}
        />
        <label htmlFor="addressDetail" className={LABEL_CLS}>
          Apartamento, local (Opcional)
        </label>
      </div>

      {/* Departamento + Ciudad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <CustomSelect
          label="Departamento"
          value={deptField.value ?? ""}
          onChange={(val) => deptField.onChange(val)}
          options={getDepartamentos()}
          placeholder="Seleccionar"
          searchable
          error={errors.department?.message}
        />
        <CustomSelect
          label="Ciudad / Municipio"
          value={cityField.value ?? ""}
          onChange={(val) => cityField.onChange(val)}
          options={municipios}
          placeholder={
            selectedDepartment ? "Seleccionar ciudad" : "Primero elige departamento"
          }
          disabled={!selectedDepartment}
          searchable
          error={errors.city?.message}
        />
      </div>

      {/* Teléfono */}
      <div className="relative">
        <input
          type="tel"
          id="phone"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          className={INPUT_CLS}
          placeholder=" "
          {...register("phone")}
        />
        <label htmlFor="phone" className={LABEL_CLS}>
          Teléfono móvil (10 dígitos)
        </label>
        <FieldError message={errors.phone?.message} />
      </div>
    </div>
  );
}
