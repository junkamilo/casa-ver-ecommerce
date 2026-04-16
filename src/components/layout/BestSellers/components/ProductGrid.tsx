import ProductCard from "@/components/ui/ProductCard";
import type { ProductGridProps } from "../types";

export function ProductGrid({ items, scrollRef }: ProductGridProps) {
  if (items.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="grid grid-flow-col auto-cols-[80vw] sm:auto-cols-[45vw] md:auto-cols-[calc(25%-18px)] gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 md:pb-2 snap-x snap-mandatory"
      style={{ scrollBehavior: "smooth" }}
    >
      {items.map((item) => (
        <div key={item.slug} className="snap-start">
          <ProductCard item={item} />
        </div>
      ))}
    </div>
  );
}
