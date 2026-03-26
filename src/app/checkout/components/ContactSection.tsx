"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useSession } from "next-auth/react";
import {
  SECTION_CLS,
  ACCENT_BAR_CLS,
  SECTION_TITLE_CLS,
  INPUT_CLS,
  LABEL_CLS,
} from "../constants/constants";
import type { CheckoutFormData } from "../types/schema";

const ContactSection = () => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Pre-rellenar email para usuarios con sesión activa
  useEffect(() => {
    if (isAuthenticated && session?.user?.email) {
      setValue("email", session.user.email, { shouldValidate: false });
    }
  }, [isAuthenticated, session, setValue]);

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <section className={SECTION_CLS}>
      <div className={ACCENT_BAR_CLS} />

      <div className="flex items-center justify-between gap-3 mb-6">
        <h2
          className={SECTION_TITLE_CLS}
          style={{ fontFamily: "Georgia, serif" }}
        >
          <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-[#C19A6B] shrink-0" />
          Contacto
          {isAuthenticated && firstName && (
            <span className="text-xs sm:text-sm text-gray-400 font-normal ml-1">
              · Hola, {firstName}
            </span>
          )}
        </h2>

        {!isAuthenticated && (
          <Link
            href="/login"
            className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#C19A6B] hover:text-[#154734] transition-colors border-b border-transparent hover:border-[#154734] pb-0.5 p-1 active:scale-90 shrink-0"
          >
            Iniciar sesión
          </Link>
        )}
      </div>

      <div className="relative">
        <input
          type="email"
          id="email"
          autoComplete="email"
          className={`${INPUT_CLS} ${isAuthenticated ? "text-gray-400 cursor-default select-none" : ""}`}
          placeholder=" "
          readOnly={isAuthenticated}
          {...register("email")}
        />
        <label htmlFor="email" className={LABEL_CLS}>
          Correo electrónico
        </label>
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">
            {errors.email.message}
          </p>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
