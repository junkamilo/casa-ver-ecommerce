"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { CheckoutFormData } from "../hooks/useCheckout";

const fi =
  "peer w-full px-5 py-4 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 text-sm text-[#154734] shadow-inner pt-6";
const fl =
  "absolute left-5 top-4 text-gray-400 text-sm transition-all duration-300 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:text-[#C19A6B] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-widest pointer-events-none";

const ContactSection = () => {
  const { register, formState: { errors } } = useFormContext<CheckoutFormData>();

  return (
    <section className="mb-10 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />

      <div className="flex justify-between items-end mb-6">
        <h2
          className="text-xl sm:text-2xl text-[#154734] flex items-center gap-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <Mail className="w-5 h-5 text-[#C19A6B]" /> Contacto
        </h2>
        <Link
          href="/login"
          className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#C19A6B] hover:text-[#154734] transition-colors border-b border-transparent hover:border-[#154734] pb-0.5"
        >
          Iniciar sesión
        </Link>
      </div>

      <div className="space-y-5">
        <div className="relative">
          <input
            type="email"
            id="email"
            className={fi}
            placeholder=" "
            {...register("email")}
          />
          <label htmlFor="email" className={fl}>
            Correo electrónico
          </label>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>
          )}
        </div>

        <label className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 cursor-pointer group w-fit">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-[#C19A6B]/30 checked:bg-[#C19A6B] checked:border-[#C19A6B] transition-colors cursor-pointer"
            />
            <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 10 8 14 16 6" />
              </svg>
            </div>
          </div>
          <span className="group-hover:text-[#154734] transition-colors">
            Quiero recibir ofertas exclusivas de Casa Verde
          </span>
        </label>
      </div>
    </section>
  );
};

export default ContactSection;
