"use client";

import { useState, useMemo } from "react";
import type { CategoriesClientProps } from "../types";
import type { SortValue } from "../constants";
import { CategoriesToolbar } from "./CategoriesToolbar";
import { CategoryListCard } from "./CategoryListCard";
import { CategoryGridCard } from "./CategoryGridCard";

export default function CategoriesClient({ categories }: CategoriesClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortValue>("relevance");

  const sorted = useMemo(() => {
    const arr = [...categories];
    if (sortBy === "name-asc") return arr.sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sortBy === "name-desc") return arr.sort((a, b) => b.name.localeCompare(a.name, "es"));
    return arr; // relevance = orden original del servidor
  }, [categories, sortBy]);

  return (
    <div className="bg-white rounded-4xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-15px_rgba(21,71,52,0.05)] border border-gray-100/80 relative overflow-hidden isolate animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">

      <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#C19A6B]/5 to-transparent rounded-bl-full pointer-events-none -z-10" />

      <CategoriesToolbar
        count={sorted.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="mt-8 sm:mt-10">
        {viewMode === "list" ? (
          <div className="flex flex-col gap-4 sm:gap-5">
            {sorted.map((col, i) => (
              <div
                key={col.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CategoryListCard category={col} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {sorted.map((col, i) => (
              <div
                key={col.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CategoryGridCard category={col} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
