import { BRAND_GOLD, GRADIENT_DIAGONAL, GRADIENT_BOTTOM } from "../constants";

export function Overlays() {
  return (
    <>
      <div className="absolute inset-0 z-10"                    style={{ background: GRADIENT_DIAGONAL }} aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-2/3 z-10" style={{ background: GRADIENT_BOTTOM }}   aria-hidden="true" />
      <div
        className="absolute top-0 left-0 right-0 h-px z-20 animate-border-shimmer"
        style={{ background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}, transparent)` }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px z-20"
        style={{ background: "linear-gradient(90deg, transparent, rgba(193,154,107,0.35), transparent)" }}
        aria-hidden="true"
      />
    </>
  );
}
