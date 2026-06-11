"use client";

import SectionEmptyState from "@/components/ui/SectionEmptyState";
import ProductCard from "@/components/ui/ProductCard";
import { ProductGridProps } from '../types/index';


export function ProductGrid({ products, setItemKey }: ProductGridProps) {
  if (products.length === 0) {
    return <SectionEmptyState message="Pronto añadiremos nuevas prendas exclusivas a esta colección." />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {products.map((item, index) => (
        <div
          key={item.slug}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both h-full"
          // Máximo 300 ms de delay — con 44 productos antes llegaba a 4.4 s
          style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
        >
          <ProductCard item={item} viewMode="grid" setItemKey={setItemKey} index={index} />
        </div>
      ))}
    </div>
  );
}
