import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItemCardProps } from "../types";

const CartItemCard = ({ item, onRemove, onUpdateQty }: CartItemCardProps) => (
  <div className="flex gap-4">
    <div className="relative w-24 h-32 shrink-0 bg-muted rounded overflow-hidden border border-border/50">
      <Image src={item.image} alt={item.name} fill className="object-cover" />
    </div>

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

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-border rounded h-10 w-28">
          <button
            onClick={() => onUpdateQty(item.id, -1)}
            className="w-10 h-full flex items-center justify-center hover:bg-muted active:bg-muted touch-target"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="flex-1 text-center text-xs font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.id, 1)}
            className="w-10 h-full flex items-center justify-center hover:bg-muted active:bg-muted touch-target"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-2.5 touch-target active:scale-90"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

export default CartItemCard;
