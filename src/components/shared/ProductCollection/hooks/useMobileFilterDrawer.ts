"use client";

import { useState } from "react";

export function useMobileFilterDrawer() {
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);

  return {
    isPriceOpen,
    setIsPriceOpen,
    isColorOpen,
    setIsColorOpen,
  };
}
