"use client";

import { Minus, Plus } from "lucide-react";
import type { QuantityControlsProps } from "../types";

/**
 * QuantityControls
 * Controles para aumentar/disminuir cantidad
 * Botones - y + con cantidad en el medio
 */
export function QuantityControls({
  quantity,
  onIncrease,
  onDecrease,
  minQuantity = 1,
}: QuantityControlsProps) {
  return (
    <div className="flex items-center border border-border rounded h-8 w-24">
      <button
        onClick={onDecrease}
        disabled={quantity <= minQuantity}
        className="w-8 h-full flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Disminuir cantidad"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="flex-1 text-center text-xs font-medium">{quantity}</span>
      <button
        onClick={onIncrease}
        className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Aumentar cantidad"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export default QuantityControls;
