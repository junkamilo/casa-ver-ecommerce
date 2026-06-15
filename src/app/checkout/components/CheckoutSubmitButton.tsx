import { ShieldCheck, Loader2 } from "lucide-react";
import { LOCALE } from "../constants";

interface CheckoutSubmitButtonProps {
  isPending: boolean;
  total: number;
}

const CheckoutSubmitButton = ({ isPending, total }: CheckoutSubmitButtonProps) => (
  <button
    type="submit"
    disabled={isPending}
    className="w-full bg-[#154734] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] py-3.5 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-[#103a2a] shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.99] mb-6 lg:mb-10 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#154734]"
  >
    <span className="flex flex-row items-center justify-center gap-2 sm:gap-3">
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Pagar pedido</span>
          <span className="opacity-40 font-normal">·</span>
          <span
            className="text-sm sm:text-base font-semibold normal-case tracking-normal"
            style={{ fontFamily: "Georgia, serif" }}
          >
            ${total.toLocaleString(LOCALE)}
          </span>
        </>
      )}
    </span>
  </button>
);

export default CheckoutSubmitButton;
