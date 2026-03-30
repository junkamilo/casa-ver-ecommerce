"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export default function BackButton({ label = "Volver", className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`group inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-[#154734]/70 hover:text-[#154734] transition-colors duration-200 ${className}`}
      aria-label="Volver a la página anterior"
    >
      {/* Flecha con movimiento sutil al hover */}
      <ArrowLeft
        className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
        strokeWidth={2}
      />

      {/* Línea dorada + texto */}
      <span className="relative">
        {label}
        <span className="absolute -bottom-px left-0 w-0 h-px bg-[#C19A6B] group-hover:w-full transition-all duration-300 ease-out rounded-full" />
      </span>
    </button>
  );
}
