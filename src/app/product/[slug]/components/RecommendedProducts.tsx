"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

import { RecommendedProduct } from "../types";
import { formatPrice } from "../constants";

interface Props {
  products: RecommendedProduct[];
}

export default function RecommendedProducts({ products }: Props) {
  if (!products.length) return null;

  return (
    <section className="py-10 sm:py-20 relative overflow-hidden sm:bg-[#C19A6B] sm:border-y sm:border-gray-100 sm:rounded-[3rem] sm:mx-6 lg:mx-8 xl:mx-12 sm:shadow-[0_20px_50px_-15px_rgba(193,154,107,0.4)]">

      {/* Fondo decorativo — solo sm+ */}
      <div
        className="hidden sm:block absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#154734 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />
      <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-3/4 sm:w-1/2 h-1 bg-linear-to-r from-transparent via-white to-transparent opacity-40" />

      {/* Contenedor central alineado al resto de la página */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">

        {/* Cabecera editorial */}
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-20 px-6 sm:px-12 lg:px-16">
          <div className="flex items-center gap-4 mb-5">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#154734]" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase text-[#154734] flex items-center gap-2 drop-shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Completa tu Look
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#154734]" />
          </div>
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl text-[#154734] sm:text-white text-center tracking-tight leading-[1.1] drop-shadow-md"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Sugerencias <span className="italic text-[#C19A6B]">Exclusivas</span>
          </h2>
        </div>

        {/* ── Móvil: carrusel horizontal táctil ── */}
        <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 px-5 pb-4">
          {products.map((product) => (
            <Link
              href={`/product/${product.slug}`}
              key={product.id}
              className="group flex flex-col shrink-0 w-[68vw] bg-white rounded-3xl overflow-hidden shadow-[0_8px_32px_-8px_rgba(21,71,52,0.28)] active:scale-[0.97] transition-transform duration-200 snap-start focus-visible:outline-none"
            >
              {/* Imagen full-bleed sin padding */}
              <div className="relative aspect-4/5 overflow-hidden bg-gray-100 isolate">
                <div className="absolute inset-0 bg-linear-to-tr from-gray-200 to-gray-100 animate-pulse" />
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="68vw"
                    className="object-cover z-10 transition-transform duration-500 group-active:scale-[1.04]"
                  />
                )}
                {/* Degradado sutil en la base de la imagen */}
                <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-black/25 to-transparent z-20 pointer-events-none" />
              </div>

              {/* Info con espacio generoso */}
              <div className="flex items-center justify-between px-4 py-4 gap-3">
                <div className="flex flex-col min-w-0">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#154734] truncate mb-1">
                    {product.name}
                  </h3>
                  <p className="text-[15px] font-bold text-gray-800 leading-none">
                    {formatPrice(product.price)}
                  </p>
                </div>
                {/* Botón CTA */}
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#154734] flex items-center justify-center shadow-md">
                  <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          ))}
          {/* Spacer final */}
          <div className="shrink-0 w-2" />
        </div>

        {/* ── sm+: grid original sin cambios ── */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 px-12 lg:px-16">
          {products.map((product, index) => (
            <Link
              href={`/product/${product.slug}`}
              key={product.id}
              className="group flex flex-col bg-white/95 backdrop-blur-sm p-5 rounded-4xl border border-white/40 shadow-[0_15px_35px_-10px_rgba(21,71,52,0.15)] hover:shadow-[0_25px_50px_-15px_rgba(21,71,52,0.3)] hover:-translate-y-2 hover:bg-white transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#154734] focus-visible:ring-offset-4"
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <div className="relative aspect-3/4 mb-5 overflow-hidden bg-gray-50 rounded-2xl isolate border border-gray-100">
                <div className="absolute inset-0 bg-linear-to-tr from-gray-100 to-gray-50 animate-pulse -z-10" />
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.08] z-10"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-[#154734]/90 via-[#154734]/40 to-transparent translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out z-20 flex justify-center items-end">
                  <span className="text-white text-xs uppercase tracking-[0.25em] font-bold border-b border-[#C19A6B] pb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    Descubrir
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center text-center px-2 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#154734] mb-2 truncate w-full transition-colors duration-300 group-hover:text-[#C19A6B]">
                  {product.name}
                </h3>
                <p className="text-base text-gray-500 font-light group-hover:text-[#154734] transition-colors duration-300">
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