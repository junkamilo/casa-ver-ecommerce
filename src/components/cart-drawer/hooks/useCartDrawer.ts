import { useCart } from "@/context/CartContext";
import type { CartDrawerItem } from "../types";

export function useCartDrawer() {
  const {
    isCartOpen, closeCart, clearCart,
    items, removeFromCart, updateQuantity,
    subtotal, cartCount,
  } = useCart();

  return {
    isCartOpen,
    closeCart,
    clearCart,
    items: items as CartDrawerItem[],
    removeFromCart,
    updateQuantity,
    subtotal,
    cartCount,
  };
}
