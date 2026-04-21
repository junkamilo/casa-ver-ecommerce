import { Quote } from "lucide-react";
import { TestimonialItem } from "../types/types";

export default function TestimonialCard({
  name,
  rating,
  comment,
  avatarUrl,
  date
}: TestimonialItem) {
  return (
    // Se cambió a bg-white puro para que resalte brutalmente contra el fondo Beige nuevo
    <div className="relative flex flex-col h-full bg-white p-5 sm:p-6 rounded-[1.5rem] border border-[#C19A6B]/10 hover:border-[#C19A6B]/40 shadow-[0_5px_15px_-5px_rgba(193,154,107,0.15)] hover:shadow-[0_15px_30px_-5px_rgba(193,154,107,0.25)] hover:-translate-y-1.5 transition-all duration-500 group overflow-hidden isolate">
      
      {/* Acento decorativo superior Dorado muy sutil */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#154734] to-[#C19A6B] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out opacity-80" />
      
      {/* Icono de Comilla de fondo */}
      <Quote className="absolute -bottom-2 -right-2 w-20 h-20 text-[#C19A6B] opacity-[0.04] -z-10 rotate-12 group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700" />

      {/* Comentario (Texto más pequeño y refinado) */}
      <p className="text-xs sm:text-[13px] text-gray-600 font-light leading-relaxed mb-5 flex-1 italic group-hover:text-[#154734] transition-colors duration-300 relative z-10">
        "{comment}"
      </p>

      {/* Usuario (Perfil más compacto) */}
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50 group-hover:border-[#C19A6B]/20 transition-colors duration-300 relative z-10">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-[#154734] shrink-0 border border-white group-hover:border-[#C19A6B]/50 transition-colors duration-300 flex items-center justify-center shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#C19A6B] font-bold text-xs" style={{ fontFamily: "Georgia, serif" }}>
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] sm:text-xs font-bold text-[#154734] tracking-wider group-hover:text-[#C19A6B] transition-colors duration-300">
            {name}
          </span>
          {date && (
            <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 font-medium">
              {date}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}