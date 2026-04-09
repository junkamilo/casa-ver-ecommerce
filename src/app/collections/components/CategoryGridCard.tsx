"use client";

import Link from "next/link";
import Image from "next/image";
import type { Category } from "../types";

interface CategoryGridCardProps {
  category: Category;
}

export function CategoryGridCard({ category }: CategoryGridCardProps) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group block relative cursor-pointer w-full aspect-4/5 overflow-hidden bg-[#154734] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(21,71,52,0.2)] transition-all duration-500 rounded-2xl"
    >
      {category.image ? (
        <>
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
            sizes="(max-width: 640px) 48vw, (max-width: 768px) 40vw, 25vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#081c14]/90 via-[#0a2318]/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <span className="text-[#C19A6B] font-black uppercase tracking-widest text-sm sm:text-base text-center leading-tight group-hover:-translate-y-2 transition-transform duration-500">
            {category.name}
          </span>
        </div>
      )}

      {/* Borde interior hover */}
      <div className="absolute inset-4 border border-[#C19A6B]/0 group-hover:border-[#C19A6B]/30 transition-colors duration-700 pointer-events-none z-10" />

      {/* Nombre + Explorar (con imagen) */}
      {category.image && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 z-20">
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <h3 className="text-white text-sm sm:text-lg font-bold tracking-[0.2em] uppercase mb-2 drop-shadow-md">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              <span className="h-px w-4 bg-[#C19A6B]" />
              <span className="text-[#C19A6B] text-[10px] font-black tracking-[0.25em] uppercase">Explorar</span>
            </div>
          </div>
        </div>
      )}

      {/* Explorar (sin imagen) */}
      {!category.image && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 z-20">
          <div className="flex items-center gap-2">
            <span className="h-px w-4 bg-[#C19A6B]" />
            <span className="text-[#C19A6B] text-[10px] font-black tracking-[0.25em] uppercase">Explorar</span>
          </div>
        </div>
      )}
    </Link>
  );
}
