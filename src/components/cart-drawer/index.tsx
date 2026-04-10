"use client";

import { useCartDrawer } from "./hooks";
import { CartOverlay, CartHeader, CartItemList, CartFooter } from "./components";

const CartDrawer = () => {
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, cartCount } =
    useCartDrawer();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex flex-col justify-end sm:flex-row sm:justify-end">
      <CartOverlay onClose={closeCart} />

      <div className="relative w-full max-w-full sm:max-w-105 md:max-w-120 bg-background h-[92dvh] sm:h-full shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 rounded-t-3xl sm:rounded-none 2xl:max-w-125">
        <CartHeader cartCount={cartCount} onClose={closeCart} />

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
