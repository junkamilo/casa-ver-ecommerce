"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useMobileFilterDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeColor = searchParams.get("color");
  const hasActiveFilters = !!(
    activeColor ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice")
  );

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handlePriceChange(key: "minPrice" | "maxPrice", value: string) {
    if (key === "minPrice") setMinPriceInput(value);
    else setMaxPriceInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam(key, value), 600);
  }

  function handleColorToggle(hexCode: string) {
    const hex = hexCode.replace("#", "");
    updateParam("color", activeColor === hex ? null : hex);
  }

  function clearAllFilters() {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push(pathname);
  }

  return {
    isPriceOpen,
    setIsPriceOpen,
    isColorOpen,
    setIsColorOpen,
    minPriceInput,
    maxPriceInput,
    activeColor,
    hasActiveFilters,
    handlePriceChange,
    handleColorToggle,
    clearAllFilters,
  };
}
