"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import catEnterizoCorto from "@/assets/cat-enterizo-corto.jpg";
import catSets from "@/assets/cat-sets.jpg";
import catChaquetas from "@/assets/cat-chaquetas.jpg";
import catEnterizoLargo from "@/assets/cat-enterizo-largo.jpg";
import catBodys from "@/assets/cat-bodys.jpg";

const categories = [
  { image: catEnterizoCorto, label: "ENTERIZOS CORTOS", slug: "enterizos-cortos" },
  { image: catSets, label: "SETS", slug: "sets" },
  { image: catChaquetas, label: "CHAQUETAS", slug: "chaquetas" },
  { image: catEnterizoLargo, label: "ENTERIZOS LARGOS", slug: "enterizos-largos" },
  { image: catBodys, label: "BODYS", slug: "bodys" },
];

const Categories = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth ?? 300;
    const gap = 24;
    const distance = cardWidth + gap;
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-foreground uppercase">
          CATEGORÍAS
        </h2>

        <Link
          href="/collections"
          className="group flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-brand transition-colors"
        >
          Ver todo
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* --- CARRUSEL --- */}
      <div className="relative max-w-7xl mx-auto group/carousel">
        {/* Flecha izquierda */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-2 sm:-ml-3 w-9 h-9 sm:w-10 sm:h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-md hover:bg-background transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* Flecha derecha */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-2 sm:-mr-3 w-9 h-9 sm:w-10 sm:h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-md hover:bg-background transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* Contenedor scrollable */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide"
        >
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={`/collections/${cat.slug}`}
              className="group block cursor-pointer w-[45vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0"
            >
              <div className="relative w-full aspect-square overflow-hidden bg-muted">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 768px) 40vw, 25vw"
                />
              </div>
              <div className="bg-foreground text-primary-foreground text-center py-2 sm:py-3">
                <span className="text-[10px] sm:text-xs font-semibold tracking-wider">{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
