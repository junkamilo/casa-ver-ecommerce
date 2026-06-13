import Image from "next/image";
import { Package } from "lucide-react";
import { formatPrice } from "../constants";
import type { OrderItem } from "../types/types";

interface AdminOrderItemRowProps {
  item: OrderItem;
  compact?: boolean;
}

function formatDetailLine(item: OrderItem): string {
  const parts = [
    item.colorName || "—",
    `Talla ${item.size || "—"}`,
    item.sku ? `SKU ${item.sku}` : null,
    `Cant. ${item.qty}`,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function AdminOrderItemRow({ item, compact = false }: AdminOrderItemRowProps) {
  const lineTotal = item.lineTotal ?? item.price * item.qty;
  const thumbSize = compact ? "w-10 h-10" : "w-14 h-14";

  return (
    <div className={`flex items-center gap-3 ${compact ? "py-2" : "py-3"}`}>
      <div
        className={`relative ${thumbSize} rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes={compact ? "40px" : "56px"}
          />
        ) : (
          <Package className="w-5 h-5 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-900 truncate ${compact ? "text-xs" : "text-sm"}`}>
          {item.name}
        </p>
        <p className={`text-gray-500 mt-0.5 ${compact ? "text-[11px]" : "text-xs"}`}>
          {formatDetailLine(item)}
        </p>
        {!compact && (
          <p className="text-[11px] text-gray-400 mt-0.5">
            {formatPrice(item.price)} c/u
          </p>
        )}
      </div>
      <div className={`font-semibold text-gray-900 shrink-0 ${compact ? "text-xs" : "text-sm"}`}>
        {formatPrice(lineTotal)}
      </div>
    </div>
  );
}
