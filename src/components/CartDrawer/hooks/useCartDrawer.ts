"use client";

import { useCart } from "@/context/CartContext";
import type { UseCartDrawerReturn } from "../types";

/**
 * Custom hook que encapsula la lógica del CartDrawer
 * Proporciona todos los datos y handlers necesarios para el drawer
 */
export const useCartDrawer = (): UseCartDrawerReturn => {
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, cartCount } =
    useCart();

  /**
   * Maneja el click en el overlay
   * Solo cierra si el click es directamente en el overlay (no en el panel)
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  return {
    isOpen: isCartOpen,
    closeCart,
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    cartCount,
    handleOverlayClick,
  };
};
