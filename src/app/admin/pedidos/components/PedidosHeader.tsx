"use client";

import type { PedidosHeaderProps } from "../types/types";

export function PedidosHeader({ title = "Pedidos" }: PedidosHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
    </div>
  );
}
