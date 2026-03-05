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
    <section className="py-20 sm:py-20 relative overflow-hidden bg-[#C19A6B] border-y border-gray-100 rounded-[2.5rem] sm:rounded-[3rem] mx-4 sm:mx-6 lg:mx-8 xl:mx-12 shadow-[0_20px_50px_-15px_rgba(193,154,107,0.4)]">
      
      {/* Fondo decorativo sutil con patrón verde oscuro */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(#154734 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
      />
      
      {/* Resplandor superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 sm:w-1/2 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-40" />

      {/* Contenedor central alineado al resto de la página */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        
        {/* Cabecera editorial */}
        <div className="flex flex-col items-center justify-center mb-16 sm:mb-20">
          <div className="flex items-center gap-4 mb-5">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#154734]" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase text-[#154734] flex items-center gap-2 drop-shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Completa tu Look
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#154734]" />
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl text-white text-center tracking-tight leading-[1.1] drop-shadow-md"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Sugerencias <span className="italic text-[#154734]">Exclusivas</span>
          </h2>
        </div>

        {/* Grilla de productos con Cards para Profundidad */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {products.map((product, index) => (
            <Link
              href={`/product/${product.slug}`}
              key={product.id}
              className="group flex flex-col bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-[2rem] border border-white/40 shadow-[0_15px_35px_-10px_rgba(21,71,52,0.15)] hover:shadow-[0_25px_50px_-15px_rgba(21,71,52,0.3)] hover:-translate-y-2 hover:bg-white transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#154734] focus-visible:ring-offset-4"
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              {/* Contenedor imagen */}
              <div className="relative aspect-[3/4] mb-5 overflow-hidden bg-gray-50 rounded-2xl isolate border border-gray-100">
                
                {/* Skeleton animado */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 animate-pulse -z-10" />

                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.08] z-10"
                  />
                )}

                {/* Overlay Interactivo "Ver artículo" */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#154734]/90 via-[#154734]/40 to-transparent translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out z-20 flex justify-center items-end">
                  <span className="text-white text-[10px] sm:text-xs uppercase tracking-[0.25em] font-bold border-b border-[#C19A6B] pb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    Descubrir
                  </span>
                </div>
              </div>

              {/* Info del Producto */}
              <div className="flex flex-col items-center text-center px-2 pb-2">
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#154734] mb-2 truncate w-full transition-colors duration-300 group-hover:text-[#C19A6B]">
                  {product.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-light group-hover:text-[#154734] transition-colors duration-300">
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