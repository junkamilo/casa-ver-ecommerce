"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { QuantityControls } from "./QuantityControls";
import type { CartItemCardProps } from "../types";

/**
 * CartItemCard
 * Card individual para cada producto en el carrito
 * Muestra imagen, detalles, controles de cantidad y botón eliminar
 */
export function CartItemCard({ item, onRemove, onUpdateQuantity }: CartItemCardProps) {
  return (
    <div className="flex gap-4">
      {/* Imagen */}
      <div className="relative w-24 h-32 flex-shrink-0 bg-muted rounded overflow-hidden border border-border/50">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      {/* Detalles */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm font-bold text-foreground line-clamp-2 pr-2">{item.name}</h3>
            <span className="text-sm font-semibold">
              ${(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {item.color} {item.size ? `· ${item.size}` : ""}
          </p>
          <p className="text-xs text-muted-foreground mb-3">${item.price.toLocaleString()}</p>
        </div>

        {/* Controles: Cantidad y Eliminar */}
        <div className="flex items-center gap-3">
          <QuantityControls
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.id, 1)}
            onDecrease={() => onUpdateQuantity(item.id, -1)}
          />

          <button
            onClick={() => onRemove(item.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            aria-label="Eliminar producto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItemCard;
