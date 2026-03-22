import { Phone } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormData } from "../types/types";

interface PhoneFieldProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

const PhoneField = ({ register, errors }: PhoneFieldProps) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between ml-0.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Número de Celular
      </label>
      <span className="text-[10px] text-gray-400 font-medium">Opcional</span>
    </div>
    <div className="relative">
      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
      <input
        {...register("phone")}
        type="tel"
        placeholder="Ej: 3001234567"
        inputMode="numeric"
        onKeyDown={(e) => {
          const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
          if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
            e.preventDefault();
          }
        }}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text");
          if (!/^\d+$/.test(pasted)) e.preventDefault();
        }}
        className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 focus:border-[#C19A6B] focus:bg-white transition-all placeholder:text-gray-400"
      />
    </div>
    {errors.phone && (
      <p className="text-xs text-red-500 ml-0.5">{errors.phone.message}</p>
    )}
  </div>
);

export default PhoneField;
