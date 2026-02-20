"use client";

import { useCartDrawer } from "./hooks/useCartDrawer";
import { CartOverlay } from "./components/CartOverlay";
import { CartPanel } from "./components/CartPanel";
import { CartHeader } from "./components/CartHeader";
import { CartContent } from "./components/CartContent";
import { CartFooter } from "./components/CartFooter";

/**
 * CartDrawer
 * Componente principal que orquesta el drawer del carrito
 * Coordina todos los sub-componentes y la lógica del carrito
 */
export function CartDrawer() {
  const { isOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, cartCount, handleOverlayClick } =
    useCartDrawer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <CartOverlay isOpen={isOpen} onClose={closeCart} />

      <CartPanel isOpen={isOpen}>
        <CartHeader cartCount={cartCount} onClose={closeCart} />

        <CartContent items={items} onItemRemove={removeFromCart} onQuantityChange={updateQuantity} />

        <CartFooter subtotal={subtotal} itemCount={items.length} onCheckout={closeCart} />
      </CartPanel>
    </div>
  );
}

export default CartDrawer;
