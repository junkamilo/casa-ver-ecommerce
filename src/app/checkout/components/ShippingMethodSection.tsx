import { Truck } from "lucide-react";
import { LOCALE, SECTION_CLS, ACCENT_BAR_CLS, SECTION_TITLE_CLS } from "../constants";

interface ShippingMethodSectionProps {
  shippingCost: number;
}

const ShippingMethodSection = ({ shippingCost }: ShippingMethodSectionProps) => (
  <section className={SECTION_CLS}>
    <div className={ACCENT_BAR_CLS} />
    <h2
      className={`${SECTION_TITLE_CLS} mb-4 sm:mb-6`}
      style={{ fontFamily: "Georgia, serif" }}
    >
      <Truck className="w-4 sm:w-5 h-4 sm:h-5 text-[#C19A6B] shrink-0" /> Método de envío
    </h2>
    <div className="bg-[#FAFAFA] border border-[#C19A6B]/40 rounded-xl px-3 sm:px-5 py-3.5 sm:py-5 flex justify-between items-center shadow-inner relative overflow-hidden group cursor-pointer hover:bg-white transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#C19A6B]" />
      <div className="flex items-center gap-2.5 sm:gap-4 pl-2">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-4 sm:border-[5px] border-[#154734] bg-white shrink-0 shadow-sm" />
        <span className="text-xs sm:text-sm font-bold text-[#154734] tracking-wide">
          Envío Nacional Premium
        </span>
      </div>
      <span className="text-xs sm:text-sm font-black text-[#154734] shrink-0 ml-2">
        ${shippingCost.toLocaleString(LOCALE)}
      </span>
    </div>
  </section>
);

export default ShippingMethodSection;
