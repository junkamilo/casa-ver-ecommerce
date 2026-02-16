"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

interface ProductCard {
  image: StaticImageData;
  name: string;
  price: string;
  rating?: number;
  reviews?: string;
  colors?: string[];
  colorLabel?: string;
  badge?: string;
  slug: string;
}

const products: ProductCard[] = [
  {
    image: product1,
    name: "SET SHORT BODY CAMISETA",
    price: "$140.000",
    rating: 5,
    reviews: "1 reseñas",
    colors: ["#a8d4f0", "#8b6f5e", "#2d2d2d", "#c4a882"],
    colorLabel: "AZUL BEBÉ",
    slug: "set-short-body-camiseta",
  },
  {
    image: product2,
    name: "SET PANT G",
    price: "$150.000",
    badge: "Agotado",
    slug: "set-pant-g",
  },
  {
    image: product3,
    name: "SET PANT ICON",
    price: "$185.000",
    colors: ["#a8d4f0", "#f5f0c4", "#2d2d2d", "#8b6f5e", "#1a1a1a"],
    colorLabel: "AZUL BEBÉ",
    slug: "set-pant-icon",
  },
  {
    image: product4,
    name: "SET AURORA",
    price: "$190.000",
    rating: 3,
    reviews: "1 reseñas",
    colors: ["#d4c4a8", "#8b6f5e", "#1a1a1a"],
    colorLabel: "BEIGE",
    slug: "set-aurora",
  },
  {
    image: product5,
    name: "SET PANT G SIN PUSH",
    price: "$150.000",
    colors: ["#8b6f5e", "#3d6b8a"],
    colorLabel: "CAFÉ",
    slug: "set-pant-g-sin-push",
  },
  {
    image: product5,
    name: "SET PANT G SIN PUSH",
    price: "$150.000",
    colors: ["#8b6f5e", "#3d6b8a"],
    colorLabel: "CAFÉ",
    slug: "set-pant-g-sin-push",
  },
];

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const BestSellers = () => {
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

      {/* --- HEADER (Título izq - Link der) --- */}
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-foreground uppercase title-accent">
          MÁS VENDIDOS
        </h2>

        <Link
          href="/collections/mas-vendidos"
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
          {products.map((product, i) => (
            <Link
              href={`/product/${product.slug}`}
              key={i}
              className="group block cursor-pointer w-[45vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0 hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Imagen con Aspect Ratio controlado */}
              <div className="relative overflow-hidden mb-3 aspect-[3/4] bg-muted shadow-premium group-hover:shadow-premium-hover transition-shadow duration-300">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  placeholder="blur"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              <h3 className="text-xs sm:text-sm font-bold tracking-wider text-foreground mb-1 uppercase group-hover:text-brand transition-colors">
                {product.name}
              </h3>

              {product.rating && (
                <div className="flex items-center gap-2 mb-1">
                  <RatingStars rating={product.rating} />
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>
              )}

              <p className="text-sm font-medium text-primary mb-2">{product.price}</p>

              {product.colors && (
                <div className="flex gap-1.5">
                  {product.colors.map((color, ci) => (
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

export default BestSellers;
