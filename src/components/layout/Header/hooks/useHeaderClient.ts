"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";

export function useHeaderClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { cartCount, openCart } = useCart();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === "ADMIN";

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
    isAdmin,
    cartCount,
    openCart,
    openSearch,
    setMenuOpen,
    setIsCategoriesHovered,
    setIsUserMenuOpen,
    setIsSearchModalOpen,
  };
}
