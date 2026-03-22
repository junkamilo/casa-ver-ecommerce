"use client";

import { MapPin, ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { DEPARTAMENTOS } from "@/lib/constants/colombia";
import { SavedAddressPicker } from "./SavedAddressPicker";
import type { CheckoutFormData } from "../hooks/useCheckout";

const fi =
  "peer w-full px-5 py-4 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 text-sm text-[#154734] shadow-inner pt-6";
const fl =
  "absolute left-5 top-4 text-gray-400 text-sm transition-all duration-300 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:text-[#C19A6B] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-widest pointer-events-none";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{message}</p> : null;

const DeliverySection = () => {
  const { register, formState: { errors } } = useFormContext<CheckoutFormData>();

  return (
    <section className="mb-8 sm:mb-10 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-4xl border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />

      <h2
        className="text-lg sm:text-xl md:text-2xl text-[#154734] mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3"
        style={{ fontFamily: "Georgia, serif" }}
      >
        <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-[#C19A6B] shrink-0" /> Dirección de entrega
      </h2>

      <SavedAddressPicker />

      <div className="space-y-4 sm:space-y-5">
        <div className="relative group">
          <select className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[#FAFAFA] border border-gray-200 rounded-xl appearance-none text-[#154734] font-medium outline-none focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all duration-300 text-sm shadow-inner cursor-pointer pt-5 sm:pt-6 peer h-12 sm:h-auto">
            <option value="CO">Colombia</option>
          </select>
          <label className="absolute left-5 top-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none">
            País / Región
          </label>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C19A6B] pointer-events-none" />
        </div>

        {/* Nombre + Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative">
            <input type="text" id="firstName" className={fi} placeholder=" " {...register("firstName")} />
            <label htmlFor="firstName" className={fl}>Nombre</label>
            <FieldError message={errors.firstName?.message} />
          </div>
          <div className="relative">
            <input type="text" id="lastName" className={fi} placeholder=" " {...register("lastName")} />
            <label htmlFor="lastName" className={fl}>Apellidos</label>
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>

        {/* Cédula */}
        <div className="relative">
          <input type="text" id="cedula" className={fi} placeholder=" " {...register("cedula")} />
          <label htmlFor="cedula" className={fl}>Cédula / NIT</label>
          <FieldError message={errors.cedula?.message} />
        </div>

        {/* Dirección */}
        <div className="relative">
          <input type="text" id="address" className={fi} placeholder=" " {...register("address")} />
          <label htmlFor="address" className={fl}>Dirección (Calle, Carrera...)</label>
          <FieldError message={errors.address?.message} />
        </div>

        {/* Apto + Ciudad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative">
            <input type="text" id="addressDetail" className={fi} placeholder=" " {...register("addressDetail")} />
            <label htmlFor="addressDetail" className={fl}>Apartamento, local (Opcional)</label>
          </div>
          <div className="relative">
            <input type="text" id="city" className={fi} placeholder=" " {...register("city")} />
            <label htmlFor="city" className={fl}>Ciudad</label>
            <FieldError message={errors.city?.message} />
          </div>
        </div>

        {/* Departamento + Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative">
            <select
              id="department"
              className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-200 rounded-xl appearance-none text-[#154734] outline-none focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all duration-300 text-sm shadow-inner cursor-pointer pt-6"
              {...register("department")}
            >
              <option value="">Seleccionar</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <label className="absolute left-5 top-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none">
              Departamento
            </label>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <FieldError message={errors.department?.message} />
          </div>
          <div className="relative">
            <input type="tel" id="phone" className={fi} placeholder=" " {...register("phone")} />
            <label htmlFor="phone" className={fl}>Teléfono móvil</label>
            <FieldError message={errors.phone?.message} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
