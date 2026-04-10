"use client";

import { ANNOUNCEMENTS, MARQUEE_COPIES, STYLES } from "./constants";
import { AnnouncementItem } from "./components";

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
