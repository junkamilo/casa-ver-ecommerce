"use client";

import SectionEmptyState from "@/components/ui/SectionEmptyState";
import ProductCard from "@/components/ui/ProductCard";
import { ProductGridProps } from '../types/index';


export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <SectionEmptyState message="Pronto añadiremos nuevas prendas exclusivas a esta colección." />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {products.map((item, index) => (
        <div
          key={item.slug}
          className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both h-full"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductCard item={item} viewMode="grid" />
        </div>
      ))}
    </div>
  );
}
