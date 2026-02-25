"use client";

import { useCart } from "@/context/CartContext";
import CartOverlay from "./components/CartOverlay";
import CartHeader from "./components/CartHeader";
import CartItemList from "./components/CartItemList";
import CartFooter from "./components/CartFooter";

const CartDrawer = () => {
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, cartCount } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <CartOverlay onClose={closeCart} />

      <div className="relative w-full max-w-[420px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
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
