import { ProductColor } from "../types";

interface Props {
  colors: ProductColor[];
  selected: ProductColor;
  onSelect: (color: ProductColor) => void;
}

export default function ColorSelector({ colors, selected, onSelect }: Props) {
  return (
    <div className="mb-4 sm:mb-6">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        COLOR: <span className="text-foreground">{selected.name}</span>
      </span>
      <div className="flex gap-2.5 sm:gap-3 mt-2 sm:mt-3">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => onSelect(color)}
            aria-label={color.name}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border relative flex items-center justify-center transition-transform hover:scale-110 ${
              selected.name === color.name ? "ring-2 ring-offset-2 ring-foreground" : ""
            }`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  );
}
