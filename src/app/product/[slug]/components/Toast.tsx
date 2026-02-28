import { Check, ShoppingBag } from "lucide-react";

interface Props {
  show: boolean;
  productName: string;
}

export const Toast = ({ show, productName }: Props) => {
  return (
    <div
      aria-live="polite"
      // Nota: Cambié z-100 a z-[100] porque z-100 no existe por defecto en Tailwind, requiere corchetes para valores arbitrarios
      className={`fixed top-6 right-6 z-[100] flex items-center gap-4 bg-[#154734] text-white shadow-2xl rounded-xl px-5 py-4 transition-all duration-500 ease-in-out ${
        show
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-8 pointer-events-none"
      }`}
    >
      <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm shadow-inner">
        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-wide">Añadido a tu bolsa</p>
        <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5 font-light">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className="truncate max-w-[200px]">{productName}</span>
        </p>
      </div>
    </div>
  );
};
