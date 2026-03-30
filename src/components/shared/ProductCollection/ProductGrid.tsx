"use client";

import type { CollectionProduct } from "./types";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import ProductCard from "@/components/ui/ProductCard";

interface ProductGridProps {
  products: CollectionProduct[];
  viewMode: "grid" | "list";
}

export function ProductGrid({ products, viewMode }: ProductGridProps) {
  if (products.length === 0) {
    return <SectionEmptyState message="Pronto añadiremos nuevas prendas exclusivas a esta colección." />;
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-4 sm:gap-5">
        {products.map((item, index) => (
          <div
            key={item.slug}
            className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <ProductCard item={item} viewMode="list" />
          </div>
        ))}
      </div>
    );
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
