import { ALL_SIZES } from "../data";

interface Props {
  availableSizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

export default function SizeSelector({ availableSizes, selectedSize, onSelect }: Props) {
  return (
    <div className="mb-4 sm:mb-6">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        TALLA:{" "}
        <span className="text-foreground">{selectedSize || "Selecciona una talla"}</span>
      </span>
      <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
        {ALL_SIZES.map((size) => {
          const available = availableSizes.includes(size);
          return (
            <button
              key={size}
              onClick={() => available && onSelect(size)}
              disabled={!available}
              className={`min-w-12 h-10 px-3 border text-sm font-medium transition-all ${
                selectedSize === size
                  ? "border-foreground bg-foreground text-background"
                  : available
                  ? "border-border hover:border-foreground text-foreground"
                  : "border-border/40 text-muted-foreground/40 line-through cursor-not-allowed"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
