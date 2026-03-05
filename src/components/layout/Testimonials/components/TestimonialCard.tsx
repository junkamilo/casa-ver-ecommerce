// 2. Reemplaza tu componente TestimonialCard.tsx con este código:

import { Star, Quote } from "lucide-react";
import { TestimonialItem } from "../types/types";

export default function TestimonialCard({
  name,
  rating,
  comment,
  avatarUrl,
  date
}: TestimonialItem) {
  return (
    <div className="relative flex flex-col h-full bg-gradient-to-br from-white to-[#F4F9F4]/30 p-6 sm:p-8 rounded-[2rem] border-2 border-white hover:border-[#C19A6B]/40 shadow-[0_10px_30px_-15px_rgba(21,71,52,0.1)] hover:shadow-[0_25px_50px_-15px_rgba(21,71,52,0.3)] hover:-translate-y-3 transition-all duration-500 group overflow-hidden isolate">
      
      {/* Acento decorativo superior Verde */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#154734] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
      
      {/* Icono de Comilla Gigante de fondo */}
      <Quote className="absolute -bottom-4 -right-4 w-32 h-32 text-[#C19A6B] opacity-[0.04] -z-10 rotate-12 group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700" />

      {/* Estrellas en Badge */}
      <div className="flex items-center gap-1 mb-6 bg-white w-fit px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100 group-hover:border-[#C19A6B]/20 transition-colors duration-300">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-300 group-hover:scale-110 ${
              i < rating ? "fill-[#C19A6B] text-[#C19A6B] drop-shadow-[0_0_8px_rgba(193,154,107,0.4)]" : "fill-gray-100 text-gray-200"
            }`}
            style={{ transitionDelay: `${i * 50}ms` }}
          />
        ))}
      </div>

      {/* Comentario */}
      <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed mb-8 flex-1 italic group-hover:text-[#154734] transition-colors duration-300 relative z-10">
        "{comment}"
      </p>

      {/* Usuario Premium */}
      <div className="flex items-center gap-4 mt-auto pt-5 border-t border-gray-100 group-hover:border-[#154734]/20 transition-colors duration-300 relative z-10">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#154734] shadow-md shrink-0 border-2 border-white group-hover:border-[#C19A6B] transition-colors duration-300 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#C19A6B] font-bold text-lg" style={{ fontFamily: "Georgia, serif" }}>
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-bold text-[#154734] tracking-wide group-hover:text-[#C19A6B] transition-colors duration-300">
            {name}
          </span>
          {date && (
            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
              {date}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}