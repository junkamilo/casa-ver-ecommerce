"use client";

import { useCartDrawer } from "./hooks";
import { CartOverlay, CartPanel, CartHeader, CartContent, CartFooter } from "./components";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, cartCount } =
    useCartDrawer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
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
