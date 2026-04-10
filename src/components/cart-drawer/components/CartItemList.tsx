import type { CartItemListProps } from "../types";
import CartEmpty from "./CartEmpty";
import CartItemCard from "./CartItemCard";

const CartItemList = ({ items, onRemove, onUpdateQty, onClose }: CartItemListProps) => (
  <div className="flex-1 overflow-y-auto p-5 space-y-6">
    {items.length === 0 ? (
      <CartEmpty onClose={onClose} />
    ) : (
      items.map((item) => (
        <CartItemCard key={item.id} item={item} onRemove={onRemove} onUpdateQty={onUpdateQty} />
      ))
    )}
  </div>
);

export default CartItemList;
