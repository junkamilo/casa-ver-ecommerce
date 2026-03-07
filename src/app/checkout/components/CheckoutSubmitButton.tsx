import { ShieldCheck, Loader2 } from "lucide-react";

interface CheckoutSubmitButtonProps {
  isPending: boolean;
}

const CheckoutSubmitButton = ({ isPending }: CheckoutSubmitButtonProps) => (
  <button
    type="submit"
    disabled={isPending}
    className="w-full bg-[#154734] text-white text-sm sm:text-base font-bold uppercase tracking-[0.2em] py-6 rounded-2xl hover:bg-[#C19A6B] shadow-[0_15px_30px_-10px_rgba(21,71,52,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(193,154,107,0.6)] transition-all duration-500 active:scale-[0.98] mb-10 relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#154734]"
  >
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
    <span className="relative z-10 flex items-center justify-center gap-3">
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <ShieldCheck className="w-5 h-5" />
          Pagar Pedido
        </>
      )}
    </span>
  </button>
);

export default CheckoutSubmitButton;
