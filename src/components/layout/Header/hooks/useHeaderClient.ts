"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export function useHeaderClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { cartCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openSearch = () => {
    setMenuOpen(false);
    setIsSearchModalOpen(true);
  };

  return {
    menuOpen,
    isCategoriesHovered,
    isSearchModalOpen,
    isUserMenuOpen,
    scrolled,
    cartCount,
    openCart,
    openSearch,
    setMenuOpen,
    setIsCategoriesHovered,
    setIsUserMenuOpen,
    setIsSearchModalOpen,
  };
}
