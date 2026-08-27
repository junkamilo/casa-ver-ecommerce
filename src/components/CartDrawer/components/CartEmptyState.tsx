"use client";

import { ShoppingCart } from "@/components/icons";
import type { CartEmptyStateProps } from "../types";

export function CartEmptyState({ onContinueShopping }: CartEmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#154734] mb-4">
        <ShoppingCart size={28} strokeWidth={1.5} className="text-white" />
      </span>
      <p className="text-lg font-medium text-muted-foreground">Tu carrito está vacío</p>
      <button
        onClick={onContinueShopping}
        className="mt-4 text-sm underline hover:text-brand transition-colors text-muted-foreground"
        aria-label="Volver a comprar"
      >
        Seguir comprando
      </button>
    </div>
  );
}

export default CartEmptyState;
