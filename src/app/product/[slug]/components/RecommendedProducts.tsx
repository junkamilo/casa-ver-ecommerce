"use client";

import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import ProductCard from "@/components/ui/ProductCard";

interface Props {
  products: CollectionProduct[];
}

export default function RecommendedProducts({ products }: Props) {
  if (!products.length) return null;

  return (
    <section className="py-5 sm:py-7 lg:py-8 relative overflow-hidden bg-white border border-gray-200 rounded-2xl sm:rounded-3xl mx-3 sm:mx-6 lg:mx-8 xl:mx-12 shadow-[0_4px_24px_-6px_rgba(21,71,52,0.10)]">

      {/* Fondo decorativo sutil */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#154734 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* Contenedor central */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">

        {/* Cabecera editorial */}
        <div className="flex flex-col items-center justify-center mb-4 sm:mb-6 px-4 sm:px-8 lg:px-12">
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl text-[#154734] text-center tracking-tight leading-[1.1]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Sugerencias <span className="italic text-[#C19A6B]">Exclusivas</span>
          </h2>
        </div>

        {/* ── Móvil: carrusel horizontal táctil ── */}
        <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 px-4 pb-2">
          {products.map((product) => (
            <div key={product.slug} className="snap-start shrink-0 w-[65vw]">
              <ProductCard item={product} viewMode="grid" />
            </div>
          ))}
          <div className="shrink-0 w-2" />
        </div>

        {/* ── sm+: grid ── */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 px-6 sm:px-8 lg:px-12">
          {products.map((product) => (
            <ProductCard key={product.slug} item={product} viewMode="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
