import { useCart } from "@/context/CartContext";
import { CHECKOUT_MODE_KEY } from "@/context/CartContext";
import type { CartDrawerItem } from "../types";

export function useCartDrawer() {
  const {
    isCartOpen, closeCart, clearCart, clearBuyNow,
    items, removeFromCart, updateQuantity,
    subtotal, cartCount,
  } = useCart();

  const goToCheckout = () => {
    try { sessionStorage.removeItem(CHECKOUT_MODE_KEY); } catch {}
    clearBuyNow();
    closeCart();
  };

  return {
    isCartOpen,
    closeCart,
    clearCart,
    goToCheckout,
    items: items as CartDrawerItem[],
    removeFromCart,
    updateQuantity,
    subtotal,
    cartCount,
  };
}
