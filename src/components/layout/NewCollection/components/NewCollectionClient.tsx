"use client";

import useSWR from "swr";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import ProductCard from "@/components/ui/ProductCard";
import { useCarousel } from "@/components/shared/ProductCarousel/hooks/useCarousel";
import type { NewCollectionClientProps } from "../types";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const NewCollectionClient = ({ items: initialItems, hasMore: initialHasMore }: NewCollectionClientProps) => {
  const { data } = useSWR<{ items: CollectionProduct[]; hasMore: boolean }>(
    "/api/products/new-collection",
    fetcher,
    {
      fallbackData: { items: initialItems, hasMore: initialHasMore },
      refreshInterval: 60_000,
      revalidateOnFocus: false,
    }
  );
  const items = data?.items ?? initialItems;
  const hasMore = data?.hasMore ?? initialHasMore;
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();

  // On desktop: 4 cards visible at once. With gap-6 (24px):
  // each card ≈ calc(25% - 18px). On mobile: full-width or 2 per view.
  const showVerMasCard = hasMore;

  return (
    <section className="relative w-full bg-white overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto">
        <SectionHeader
          title="Nuevos"
          titleItalic="Ingresos"
          href="/collections/nueva-coleccion"
          linkText="VER TODO"
          textColor="text-[#154734]"
          hoverColor="hover:text-[#C19A6B]"
          fontClass="font-light"
        />

        {items.length === 0 && (
          <SectionEmptyState message="Pronto agregaremos nuevos ingresos." />
        )}

        {items.length > 0 && (
          <div className="relative mt-10 sm:mt-12">
            {/* Flecha izquierda — solo cuando hay scroll hacia la izquierda */}
            <button
              onClick={() => scroll("left")}
              aria-label="Anterior"
              className={`
                hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20
                w-11 h-11 rounded-full bg-white border border-[#154734]/15 shadow-md
                items-center justify-center text-[#154734]
                hover:bg-[#154734] hover:text-white hover:border-[#154734]
                transition-all duration-200 active:scale-90
                ${canScrollLeft ? "opacity-100 -translate-x-5" : "opacity-0 pointer-events-none"}
              `}
            >
              <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Flecha derecha — solo cuando NO se llegó al final Y hay más para ver */}
            <button
              onClick={() => scroll("right")}
              aria-label="Siguiente"
              className={`
                hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20
                w-11 h-11 rounded-full bg-white border border-[#154734]/15 shadow-md
                items-center justify-center text-[#154734]
                hover:bg-[#154734] hover:text-white hover:border-[#154734]
                transition-all duration-200 active:scale-90
                ${canScrollRight ? "opacity-100 translate-x-5" : "opacity-0 pointer-events-none"}
              `}
            >
              <ChevronRight className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Contenedor del carrusel — scroll horizontal en todos los breakpoints */}
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

              {/* Tarjeta "Ver más" — aparece al final solo si hay más de 8 productos */}
              {showVerMasCard && (
                <div className="snap-start flex items-stretch">
                  <Link
                    href="/collections/nueva-coleccion"
                    className="
                      flex flex-col items-center justify-center gap-3
                      w-full min-h-70 md:min-h-80
                      rounded-2xl border-2 border-dashed border-[#154734]/20
                      bg-[#154734]/3 hover:bg-[#154734]/7
                      text-[#154734] transition-all duration-200 group px-4
                    "
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-[#154734]/30 flex items-center justify-center group-hover:bg-[#154734] group-hover:border-[#154734] transition-all duration-200">
                      <ArrowRight className="w-5 h-5 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <span className="text-sm font-semibold text-center leading-snug">
                      Ver más productos
                    </span>
                  </Link>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </section>
  );
};

export default NewCollectionClient;
