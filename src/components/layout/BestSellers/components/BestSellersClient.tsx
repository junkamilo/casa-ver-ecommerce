"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { useCarousel } from "@/components/shared/ProductCarousel/hooks/useCarousel";
import { BRAND_GOLD, BRAND_GREEN } from "../constants";
import type { BestSellersClientProps } from "../types";
import { CarouselButton } from "./CarouselButton";
import { ProductGrid } from "./ProductGrid";

const BestSellersClient = ({ items }: BestSellersClientProps) => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  return (
    <section className="relative w-full bg-[#FDFBF7] border-t border-[#C19A6B]/15 overflow-hidden py-12 sm:py-16 md:py-20 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      {/* Decorative light accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#C19A6B]/50 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{ backgroundImage: "radial-gradient(#154734 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto z-10">
        <SectionHeader
          title="Los mas"
          titleItalic="vendidos"
          href="/collections/mas-vendidos"
          linkText="VER TODO"
          textColor="text-[#154734]"
          hoverColor="hover:text-[#C19A6B]"
          fontClass="font-light"
        />

        {items.length === 0 && (
          <SectionEmptyState message="Pronto agregaremos los productos más vendidos." />
        )}

        <div className="relative mt-10 sm:mt-12 group/carousel">
          <CarouselButton direction="left"  onClick={() => scroll("left")}  visible={canScrollLeft}  />
          <CarouselButton direction="right" onClick={() => scroll("right")} visible={canScrollRight} />
          <ProductGrid items={items} scrollRef={scrollRef} />
        </div>
      </div>
    </section>
  );
};

export default BestSellersClient;
