import { DELAY_FACTORS, STYLES } from "../constants";
import type { AnnouncementItemProps } from "../types";

export function AnnouncementItem({ item, index }: AnnouncementItemProps) {
  const Icon = item.icon;
  const floatDelay   = `${index * DELAY_FACTORS.float}s`;
  const glowDelay    = `${index * DELAY_FACTORS.glow}s`;
  const diamondDelay = `${index * DELAY_FACTORS.diamond + DELAY_FACTORS.diamondOffset}s`;

  return (
    <div className="flex items-center mx-8 sm:mx-12">

      {/* Ícono con halo dorado flotante */}
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

      {/* Texto del anuncio */}
      <span
        className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90"
        style={STYLES.textShadow}
      >
        {item.text}
      </span>

      {/* Separador diamante con líneas laterales */}
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
