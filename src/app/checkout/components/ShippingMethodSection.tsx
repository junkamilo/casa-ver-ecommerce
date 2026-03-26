import { Truck } from "lucide-react";
import { LOCALE } from "../constants/constants";

interface ShippingMethodSectionProps {
  shippingCost: number;
}

const ShippingMethodSection = ({ shippingCost }: ShippingMethodSectionProps) => (
  <section className="mb-8 sm:mb-10 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-4xl border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />
    <h2
      className="text-lg sm:text-xl md:text-2xl text-[#154734] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3"
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
