import { Truck } from "lucide-react";
import { LOCALE } from "../constants/constants";

interface ShippingMethodSectionProps {
  shippingCost: number;
}

const ShippingMethodSection = ({ shippingCost }: ShippingMethodSectionProps) => (
  <section className="mb-10 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />
    <h2
      className="text-xl sm:text-2xl text-[#154734] mb-6 flex items-center gap-3"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <Truck className="w-5 h-5 text-[#C19A6B]" /> Método de envío
    </h2>
    <div className="bg-[#FAFAFA] border border-[#C19A6B]/40 rounded-xl p-5 flex justify-between items-center shadow-inner relative overflow-hidden group cursor-pointer hover:bg-white transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#C19A6B]" />
      <div className="flex items-center gap-4 pl-2">
        <div className="w-5 h-5 rounded-full border-[5px] border-[#154734] bg-white flex items-center justify-center shadow-sm" />
        <span className="text-sm font-bold text-[#154734] tracking-wide">
          Envío Nacional Premium
        </span>
      </div>
      <span className="text-sm font-black text-[#154734]">
        ${shippingCost.toLocaleString(LOCALE)}
      </span>
    </div>
  </section>
);

export default ShippingMethodSection;
