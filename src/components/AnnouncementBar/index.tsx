"use client";

import { ANNOUNCEMENTS, MARQUEE_COPIES, DELAY_FACTORS, STYLES } from "./AnnouncementBar.constants";
import type { AnnouncementItemProps } from "./AnnouncementBar.types";

// ── Subcomponente: cada item del marquee (icono + texto + separador diamante) ──
function AnnouncementItem({ item, index }: AnnouncementItemProps) {
  const Icon = item.icon;
  const floatDelay   = `${index * DELAY_FACTORS.float}s`;
  const glowDelay    = `${index * DELAY_FACTORS.glow}s`;
  const diamondDelay = `${index * DELAY_FACTORS.diamond + DELAY_FACTORS.diamondOffset}s`;

  return (
    <div className="flex items-center mx-8 sm:mx-12">

      {/* ── Ícono con halo dorado flotante ── */}
      <div
        className="relative mr-2.5 sm:mr-3 shrink-0 animate-float"
        style={{ animationDelay: floatDelay }}
      >
        <span
          className="absolute inset-0 -m-1 rounded-full blur-sm bg-[#C19A6B]/40 animate-glow-pulse"
          style={{ animationDelay: glowDelay }}
          aria-hidden="true"
        />
        <Icon
          className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C19A6B]"
          style={STYLES.iconGlow}
          aria-hidden="true"
        />
      </div>

      {/* ── Texto del anuncio ── */}
      <span
        className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90"
        style={STYLES.textShadow}
      >
        {item.text}
      </span>

      {/* ── Separador diamante con líneas laterales ── */}
      <div className="mx-8 sm:mx-12 flex items-center gap-2 shrink-0">
        <div className="w-4 sm:w-6 h-px bg-linear-to-r from-transparent to-[#C19A6B]/40" />
        <div
          className="w-1.5 h-1.5 animate-diamond-breathe"
          style={{ ...STYLES.diamond, animationDelay: diamondDelay }}
          aria-hidden="true"
        />
        <div className="w-4 sm:w-6 h-px bg-linear-to-l from-transparent to-[#C19A6B]/40" />
      </div>

    </div>
  );
}

// ── Componente principal ──
export default function AnnouncementBar() {
  return (
    <div className="relative w-full select-none">

      {/* Línea de borde superior: degradado dorado que respira */}
      <div className="animate-border-shimmer h-[1.5px] bg-linear-to-r from-transparent via-[#C19A6B] to-transparent" />

      {/* Barra principal */}
      <div
        className="relative bg-[#154734] py-2.5 sm:py-3 flex items-center overflow-hidden group"
        style={STYLES.barBackground}
      >
        {/* Efecto Aurora */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={STYLES.aurora}
        />

        {/* Barrido de luz dorada */}
        <div
          className="absolute top-0 bottom-0 w-24 sm:w-32 pointer-events-none z-20 animate-shine-sweep"
          style={STYLES.shineSweep}
        />

        {/* Fades laterales */}
        <div className="absolute inset-y-0 left-0 w-20 sm:w-36 z-10 pointer-events-none bg-linear-to-r from-[#154734] via-[#154734]/90 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-20 sm:w-36 z-10 pointer-events-none bg-linear-to-l from-[#154734] via-[#154734]/90 to-transparent" />

        {/* Marquee */}
        <div
          className="flex whitespace-nowrap animate-marquee group-hover:paused will-change-transform"
          aria-label="Anuncios de la tienda"
        >
          {Array.from({ length: MARQUEE_COPIES }, (_, arrayIndex) => (
            <div key={arrayIndex} className="flex items-center">
              {ANNOUNCEMENTS.map((item, index) => (
                <AnnouncementItem
                  key={`${arrayIndex}-${index}`}
                  item={item}
                  arrayIndex={arrayIndex}
                  index={index}
                />
              ))}
            </div>
          ))}
        </div>

      </div>

      {/* Línea de borde inferior */}
      <div className="h-px bg-linear-to-r from-transparent via-[#C19A6B]/35 to-transparent" />

    </div>
  );
}
