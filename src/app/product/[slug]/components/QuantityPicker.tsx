"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  quantity: number;
  stock: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export default function QuantityPicker({ quantity, stock, onDecrease, onIncrease }: Props) {
  return (
    <div className="flex items-center bg-[#FAFAFA] border border-gray-200 rounded-xl h-14 w-32 sm:w-36 overflow-hidden shadow-sm transition-all duration-300 hover:border-[#C19A6B]/50 hover:shadow-md group">

      <button
        aria-label="Disminuir cantidad"
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="w-12 h-full flex items-center justify-center text-gray-400 transition-all duration-300 hover:bg-white hover:text-[#154734] active:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <Minus className="w-4 h-4" strokeWidth={2} />
      </button>

      <span className="flex-1 text-center font-bold text-[#154734] text-sm sm:text-base select-none transition-transform duration-300 group-hover:scale-110">
        {quantity}
      </span>

      <button
        aria-label="Aumentar cantidad"
        onClick={onIncrease}
        disabled={quantity >= stock}
        className="w-12 h-full flex items-center justify-center text-gray-400 transition-all duration-300 hover:bg-white hover:text-[#154734] active:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
