import { z } from "zod";

export const MAX_ADDRESSES = 5;

// ── Zod schema del formulario de dirección ──────────────────────────────────
export const addressSchema = z.object({
  fullName:      z.string().min(2, "Nombre requerido (mínimo 2 caracteres)"),
  cedula:        z.string().regex(/^\d*$/, "Solo números"),
  phone:         z.string().min(7, "Teléfono inválido").regex(/^\d+$/, "Solo números"),
  department:    z.string().min(2, "Selecciona un departamento"),
  city:          z.string().min(2, "Selecciona una ciudad"),
  address:       z.string().min(5, "Dirección muy corta (mínimo 5 caracteres)"),
  addressDetail: z.string(),
  zipCode:       z.string(),
  isDefault:     z.boolean(),
});

export const ADDRESS_FORM_DEFAULTS = {
  fullName:      "",
  cedula:        "",
  phone:         "",
  department:    "",
  city:          "",
  address:       "",
  addressDetail: "",
  zipCode:       "",
  isDefault:     false,
};

// ── Clases Tailwind reutilizables del formulario ────────────────────────────
export const FORM_STYLES = {
  /** Campo de texto con label flotante */
  input:
    "peer w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-200 text-sm text-[#154734] pt-6 placeholder-transparent",
  /** Label flotante del campo de texto */
  label:
    "absolute left-4 top-3.5 text-gray-400 text-sm transition-all duration-200 peer-focus:-translate-y-2 peer-focus:text-[10px] peer-focus:text-[#C19A6B] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-widest pointer-events-none",
  /** Select con estilo consistente */
  select:
    "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none text-[#154734] outline-none focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all duration-200 text-sm cursor-pointer pt-6 disabled:cursor-not-allowed disabled:opacity-50",
};
