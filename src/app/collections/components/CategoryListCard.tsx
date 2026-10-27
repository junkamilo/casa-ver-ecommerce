"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { Category } from "../types";

interface CategoryListCardProps {
  category: Category;
}

export function CategoryListCard({ category }: CategoryListCardProps) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group flex gap-4 sm:gap-6 bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[color:var(--theme-accent)]/20 hover:border-[color:var(--theme-accent)]/60 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(193,154,107,0.15)] transition-all duration-500"
    >
      {/* Miniatura */}
      <div className="relative w-24 sm:w-36 shrink-0 aspect-square overflow-hidden rounded-xl bg-[color:var(--theme-primary)]">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 96px, 144px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[color:var(--theme-accent)] font-black text-xs uppercase tracking-widest text-center px-2">
              {category.name}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[color:color-mix(in_srgb,var(--theme-primary)_60%,black)]/50 to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center gap-2 flex-1 py-1">
        <h3 className="text-sm sm:text-base font-bold uppercase tracking-widest text-[color:var(--theme-primary)] group-hover:text-[color:var(--theme-accent)] transition-colors duration-300">
          {category.name}
        </h3>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="h-px w-4 bg-[color:var(--theme-accent)]" />
          <span className="text-[color:var(--theme-accent)] text-[10px] font-black tracking-[0.25em] uppercase">Explorar</span>
        </div>
      </div>

      {/* Flecha */}
      <div className="flex items-center pr-1 text-gray-300 group-hover:text-[color:var(--theme-accent)] transition-colors duration-300 shrink-0">
        <ChevronDown className="w-4 h-4 -rotate-90" />
      </div>
    </Link>
  );
}
