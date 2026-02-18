import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton = ({ isLoading }: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full bg-[#154734] hover:bg-[#0f382a] text-white font-bold py-3 sm:py-3.5 text-sm sm:text-base rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
  >
    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
  </button>
);

export default SubmitButton;
