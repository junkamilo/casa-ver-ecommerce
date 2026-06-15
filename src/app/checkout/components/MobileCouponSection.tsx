import { TicketPercent } from "lucide-react";
import { SECTION_CLS, ACCENT_BAR_CLS, SECTION_TITLE_CLS } from "../constants";
import type { CouponState } from "../types";
import CouponInput from "./shared/CouponInput";

interface MobileCouponSectionProps {
  coupon: CouponState;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  isPending?: boolean;
}

/**
 * Cupón visible al inicio del formulario (solo móvil).
 * En desktop el cupón sigue en OrderSummaryPanel.
 */
export default function MobileCouponSection({
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
  isPending = false,
}: MobileCouponSectionProps) {
  const isApplied = coupon.status === "valid";
  const shouldAnimate = !isApplied;

  return (
    <section
      className={[
        "lg:hidden max-w-2xl w-full relative z-10 mb-8",
        SECTION_CLS,
        "border-[#154734]/20 shadow-[0_10px_30px_-12px_rgba(21,71,52,0.18)]",
        shouldAnimate ? "motion-safe:animate-coupon-pop motion-reduce:animate-none" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#154734]/25 via-[#154734] to-[#154734]/25 rounded-t-2xl sm:rounded-t-4xl" />
      <div className={`${ACCENT_BAR_CLS} scale-y-100`} />
      <h2
        className={`${SECTION_TITLE_CLS} mb-2 sm:mb-3`}
        style={{ fontFamily: "Georgia, serif" }}
      >
        <TicketPercent className="w-4 sm:w-5 h-4 sm:h-5 text-[#154734] shrink-0 motion-safe:animate-none" />
        Código de cupón
      </h2>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Si tienes un código de descuento, puedes aplicarlo aquí.
      </p>
      <CouponInput
        coupon={coupon}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
        disabled={isPending}
        compact
      />
    </section>
  );
}
