import Image from "next/image";
import { ProductVariant } from "../types";

interface Props {
  variants: ProductVariant[];
  activeIndex: number;
  currentType: string;
  onSelect: (index: number) => void;
}

export default function VariantSelector({
  variants,
  activeIndex,
  currentType,
  onSelect,
}: Props) {
  return (
    <div className="mb-4 sm:mb-6">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
        TIPO: <span className="text-foreground">{currentType}</span>
      </span>
      <div className="flex gap-2 flex-wrap">
        {variants.map((v, i) => (
          <button
            key={v.type}
            onClick={() => onSelect(i)}
            className={`relative flex items-center gap-2 px-3 py-2 border rounded-lg transition-all ${
              activeIndex === i
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground text-foreground"
            }`}
          >
            <div className="relative w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
              <Image src={v.gallery[0]} alt={v.type} fill className="object-cover" />
            </div>
            <span className="text-xs font-semibold uppercase">{v.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
