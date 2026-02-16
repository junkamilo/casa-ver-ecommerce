"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import new1 from "@/assets/new-1.jpg";
import new3 from "@/assets/new-3.jpg";
import new6 from "@/assets/new-6.jpg";
import product1 from "@/assets/product-1.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

interface CollectionItem {
  image: StaticImageData;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  colors?: string[];
  colorLabel?: string;
  slug: string;
}

const items: CollectionItem[] = [
  { image: new1, name: "SET PANT BUSO LÍNEAS", price: "$170.000", slug: "set-pant-buso" },
  {
    image: product1,
    name: "SHORT LICRADO",
    price: "$41.650",
    oldPrice: "$60.000",
    badge: "Oferta",
    colors: ["#e8c8d8", "#5c4a3e", "#e06080", "#2c3060", "#2a7040"],
    colorLabel: "ROSADO BEBÉ",
    slug: "short-licrado",
  },
  { image: new3, name: "SET SHORT AZUL EFECTO LAVADO", price: "$80.000", slug: "set-short-azul" },
  { image: product4, name: "ENTERIZO BOTA ANCHA", price: "$170.000", slug: "enterizo-bota-ancha" },
  {
    image: product3,
    name: "ENTERIZO LARGO CUADRADO",
    price: "$140.000",
    colors: ["#d4c4a8", "#a8d4f0", "#6040a0", "#e890b0"],
    colorLabel: "VAINILLA",
    slug: "enterizo-largo-cuadrado",
  },
  { image: new6, name: "ENTERIZO LARGO MANGA LARGA", price: "$170.000", slug: "enterizo-largo-manga" },
];

const NewCollection = () => {
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
          NUEVA COLECCIÓN
        </h2>

        <Link
          href="/collections/nueva-coleccion"
          className="group flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-brand transition-colors"
        >
          Ver todo
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* --- CARRUSEL --- */}
      <div className="relative max-w-7xl mx-auto">
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
          {items.map((item, i) => (
            <Link
              href={`/product/${item.slug}`}
              key={i}
              className="group block cursor-pointer w-[45vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0"
            >
              <div className="relative overflow-hidden mb-3 aspect-[3/4] bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  placeholder="blur"
                />
                {item.badge && (
                  <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <h3 className="text-xs sm:text-sm font-bold tracking-wider text-foreground mb-1 uppercase group-hover:text-brand transition-colors">
                {item.name}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground">{item.price}</span>
                {item.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">{item.oldPrice}</span>
                )}
              </div>

              {item.colors && (
                <div className="flex gap-1.5">
                  {item.colors.map((color, ci) => (
                    <span
                      key={ci}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewCollection;
