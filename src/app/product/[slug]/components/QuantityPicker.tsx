import { Minus, Plus } from "lucide-react";

interface Props {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export default function QuantityPicker({ quantity, onDecrease, onIncrease }: Props) {
  return (
    <div className="flex items-center border border-border rounded h-11 sm:h-12 w-28 sm:w-32">
      <button
        aria-label="decrease"
        onClick={onDecrease}
        className="w-9 sm:w-10 h-full flex items-center justify-center hover:bg-muted text-foreground"
      >
        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
      </button>
      <span className="flex-1 text-center font-medium text-sm sm:text-base">{quantity}</span>
      <button
        aria-label="increase"
        onClick={onIncrease}
        className="w-9 sm:w-10 h-full flex items-center justify-center hover:bg-muted text-foreground"
      >
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
