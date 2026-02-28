"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { RecommendedProduct } from "../types";
import { formatPrice } from "../constants";

interface Props {
  products: RecommendedProduct[];
}

export default function RecommendedProducts({ products }: Props) {
  if (!products.length) return null;

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden bg-[#FAFAFA] rounded-[3rem] sm:rounded-[4rem] shadow-inner px-4 sm:px-8 lg:px-12 xl:px-16 mx-4 sm:mx-6 lg:mx-8 xl:mx-12 mb-24">
      
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Cabecera editorial */}
        <div className="flex flex-col items-center justify-center mb-16 sm:mb-24">
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#C19A6B]" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.5em] uppercase text-[#C19A6B] flex items-center gap-2 drop-shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Completa tu Look
            </span>
            <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#C19A6B]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl text-[#154734] text-center tracking-tight leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Recomendados <span className="italic text-[#C19A6B]">para ti</span>
          </h2>
        </div>

        {/* Grilla de productos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {products.map((product, index) => (
            <Link
              href={`/product/${product.slug}`}
              key={product.id}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-4 rounded-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Contenedor imagen */}
              <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-[0_20px_40px_-15px_rgba(21,71,52,0.15)] group-hover:border-[#C19A6B]/30 transition-all duration-500">
                
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-gray-100 animate-pulse" />

                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.08] z-10"
                  />
                )}

                {/* Overlay "Ver artículo" */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-20 flex justify-center">
                  <span className="text-white text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold border-b border-white/40 pb-1 group-hover:border-white transition-colors duration-300">
                    Ver artículo
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="text-center px-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#154734] mb-2 truncate transition-colors duration-300 group-hover:text-[#C19A6B]">
                  {product.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-medium">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}