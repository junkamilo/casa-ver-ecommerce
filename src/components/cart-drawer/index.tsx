"use client";

import { useEffect } from "react";
import { useCartDrawer } from "./hooks";
import { CartOverlay, CartHeader, CartItemList, CartFooter } from "./components";

const CartDrawer = () => {
  const {
    isCartOpen, closeCart, clearCart,
    items, removeFromCart, updateQuantity,
    subtotal, cartCount,
  } = useCartDrawer();

  // Cerrar con Escape
  useEffect(() => {
    if (!isCartOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:flex-row sm:justify-end">
      <CartOverlay onClose={closeCart} />

      <div className="relative w-full max-w-full sm:max-w-105 md:max-w-120 2xl:max-w-125 bg-background h-[92dvh] sm:h-full shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 rounded-t-3xl sm:rounded-none">
        <CartHeader cartCount={cartCount} onClose={closeCart} onClear={clearCart} />

        <CartItemList
          items={items}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          onClose={closeCart}
        />

        {items.length > 0 && <CartFooter subtotal={subtotal} onClose={closeCart} />}
      </div>
    </div>
  );
};

export default CartDrawer;
