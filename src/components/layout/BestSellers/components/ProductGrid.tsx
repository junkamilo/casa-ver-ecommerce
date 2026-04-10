import ProductCard from "@/components/ui/ProductCard";
import type { ProductGridProps } from "../types";

export function ProductGrid({ items, scrollRef }: ProductGridProps) {
  if (items.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="grid grid-flow-col auto-cols-[80vw] sm:auto-cols-[45vw] gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 sm:pb-6 snap-x snap-mandatory md:grid-flow-row md:auto-cols-auto md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 md:gap-6 md:overflow-visible md:pb-0 md:snap-none"
      style={{ scrollBehavior: "smooth" }}
    >
      {items.map((item) => (
        <div key={item.slug} className="snap-center md:snap-none">
          <ProductCard item={item} />
        </div>
      ))}
    </div>
  );
}
