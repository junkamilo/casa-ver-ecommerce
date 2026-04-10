import Link from "next/link";
import { BRAND_GREEN, BRAND_GOLD, SHIMMER_PRIMARY, SHIMMER_SECONDARY } from "../constants";
import type { HeroButton } from "../types";

export function CtaButton({ label, href, variant }: HeroButton) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden flex items-center justify-center",
        "px-4 sm:px-6 py-3 h-10 sm:h-11",
        "text-[10px] sm:text-[11px] font-black tracking-[0.32em] uppercase",
        "transition-all duration-400 active:scale-95 flex-1 sm:flex-none",
        "focus-visible:outline",
        isPrimary
          ? "text-white hover:shadow-[0_0_28px_rgba(193,154,107,0.28)] focus-visible:outline-[#C19A6B]"
          : "text-black hover:shadow-[0_0_28px_rgba(193,154,107,0.28)] focus-visible:outline-[#154734]",
      ].join(" ")}
      style={isPrimary ? { background: BRAND_GREEN } : { background: BRAND_GOLD }}
    >
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
        style={{ background: isPrimary ? SHIMMER_PRIMARY : SHIMMER_SECONDARY }}
      />
      <span
        className={[
          "absolute inset-0 border border-transparent transition-colors duration-400",
          isPrimary ? "group-hover:border-[#C19A6B]/45" : "group-hover:border-black/20",
        ].join(" ")}
      />
      <span className="relative">{label}</span>
    </Link>
  );
}
