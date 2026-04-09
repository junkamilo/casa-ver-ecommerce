// ---------------------------------------------------------------------------
// Negocio
// ---------------------------------------------------------------------------
export const SHIPPING_COST = 0;
export const LOCALE = "es-CO";

// ---------------------------------------------------------------------------
// CSS compartido entre secciones del checkout
// Centralizado aquí para evitar duplicación entre componentes.
// ---------------------------------------------------------------------------

/** Wrapper de cada sección del formulario */
export const SECTION_CLS =
  "mb-8 sm:mb-10 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-4xl border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300";

/** Barra de acento verde en el borde izquierdo (hover) */
export const ACCENT_BAR_CLS =
  "absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500";

/** Título h2 de cada sección */
export const SECTION_TITLE_CLS =
  "text-lg sm:text-xl md:text-2xl text-[#154734] flex items-center gap-2 sm:gap-3";

/** Input flotante con label */
export const INPUT_CLS =
  "peer w-full px-5 py-4 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 text-sm text-[#154734] shadow-inner pt-6";

/** Label flotante sobre el input */
export const LABEL_CLS =
  "absolute left-5 top-4 text-gray-400 text-sm transition-all duration-300 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:text-[#C19A6B] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-widest pointer-events-none";
