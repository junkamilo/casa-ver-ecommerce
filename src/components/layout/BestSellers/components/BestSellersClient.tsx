"use client";

import useSWR from "swr";
import SectionHeader from "@/components/ui/SectionHeader";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { useCarousel } from "@/components/shared/ProductCarousel/hooks/useCarousel";
import { BRAND_GOLD, BRAND_GREEN } from "../constants";
import type { BestSellersClientProps } from "../types";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import { CarouselButton } from "./CarouselButton";
import { ProductGrid } from "./ProductGrid";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const BestSellersClient = ({ items: initialItems }: BestSellersClientProps) => {
  const { data } = useSWR<CollectionProduct[]>("/api/products/featured", fetcher, {
    fallbackData: initialItems,
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });
  const items = data ?? initialItems;
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  return (
    <section className="relative w-full bg-white overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto">
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

        {items.length > 0 && (
          <div className="relative mt-10 sm:mt-12">
            <CarouselButton direction="left"  onClick={() => scroll("left")}  visible={canScrollLeft}  />
            <CarouselButton direction="right" onClick={() => scroll("right")} visible={canScrollRight} />
            <ProductGrid items={items} scrollRef={scrollRef} />
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellersClient;
