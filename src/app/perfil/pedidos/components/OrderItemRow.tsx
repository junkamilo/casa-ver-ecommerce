import Image from "next/image";
import { OrderItem } from "../types";
import { formatOrderPrice } from "../constants";

interface Props {
  item: OrderItem;
}

export function OrderItemRow({ item }: Props) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {item.color} · Talla {item.size} · Cant. {item.quantity}
        </p>
      </div>
      <div className="text-sm font-semibold text-gray-900 shrink-0">
        {formatOrderPrice(item.unitPrice * item.quantity)}
      </div>
    </div>
  );
}
