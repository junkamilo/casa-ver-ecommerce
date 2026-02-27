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
    <section className="py-16 sm:py-24 border-t border-gray-100">

      {/* Cabecera editorial */}
      <div className="flex flex-col items-center justify-center mb-12 sm:mb-16">
        <div className="flex items-center gap-4 mb-4">
          <span className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-[#C19A6B]" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Completa tu Look
          </span>
          <span className="h-px w-8 sm:w-12 bg-linear-to-l from-transparent to-[#C19A6B]" />
        </div>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl text-[#154734] text-center"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Recomendados para ti
        </h2>
      </div>

      {/* Grilla de productos */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
        {products.map((product) => (
          <Link
            href={`/product/${product.slug}`}
            key={product.id}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B] focus-visible:ring-offset-2 rounded-xl"
          >
            {/* Contenedor imagen */}
            <div className="relative aspect-3/4 mb-4 overflow-hidden bg-[#FAFAFA] rounded-xl shadow-sm border border-gray-50 group-hover:shadow-lg transition-all duration-500">

              <div className="absolute inset-0 bg-linear-to-tr from-gray-50 to-gray-100 animate-pulse" />

              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] z-10"
                />
              )}

              {/* Overlay "Ver artículo" */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 flex justify-center">
                <span className="text-white text-[10px] uppercase tracking-widest font-semibold border-b border-white/50 pb-0.5">
                  Ver artículo
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="text-center px-1 sm:px-2">
              <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#154734] mb-1.5 truncate transition-colors duration-300 group-hover:text-[#C19A6B]">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light">
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
