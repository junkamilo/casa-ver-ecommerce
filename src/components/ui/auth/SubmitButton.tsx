import { Loader2, type LucideIcon } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
  label: string;
  icon: LucideIcon;
}

const SubmitButton = ({ isLoading, label, icon: Icon }: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full bg-[color:var(--theme-primary)] hover:bg-[color:color-mix(in_srgb,var(--theme-primary)_80%,black)] disabled:opacity-70 text-[color:var(--theme-primary-fg)] font-semibold py-3.5 text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
  >
    {isLoading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <>
        <Icon className="w-4 h-4" />
        {label}
      </>
    )}
  </button>
);

export default SubmitButton;
