import { Truck } from "lucide-react";
import { LOCALE } from "../../constants";

interface FreeShippingBannerProps {
  /** compact=true → estilos reducidos para el panel mobile */
  compact?: boolean;
  /** Umbral de envío gratis desde ShippingConfig (COP). */
  threshold: number;
}

export default function FreeShippingBanner({
  compact = false,
  threshold,
}: FreeShippingBannerProps) {
  const formatted = threshold.toLocaleString(LOCALE);

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border border-[#154734]/15 bg-[#154734]/5 text-[#154734] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-reduce:animate-none ${
        compact ? "px-3 py-2.5 text-xs" : "px-4 py-3 text-sm"
      }`}
      role="status"
    >
      <Truck
        className={`shrink-0 text-[#154734] ${compact ? "w-4 h-4 mt-0.5" : "w-5 h-5 mt-0.5"}`}
        aria-hidden
      />
      <p className="font-medium leading-snug">
        <span className="font-bold">¡Envío gratis!</span> Tu compra supera los ${formatted}{" "}
        después de descuentos.
      </p>
    </div>
  );
}
