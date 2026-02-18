import Image from "next/image";
import { Edit2, Trash2 } from "lucide-react";
import { ProductListItem } from "../types";
import { formatPrice, getStockStatus } from "../constants";

interface Props {
  products: ProductListItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductMobileList({ products, onEdit, onDelete }: Props) {
  return (
    <div className="md:hidden divide-y divide-gray-100">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        const mainImage = product.images[0]?.url || "/placeholder.jpg";
        return (
          <div key={product.id} className="p-4 flex gap-3">
            <div className="w-16 h-16 rounded-lg bg-gray-100 border overflow-hidden relative shrink-0">
              <Image src={mainImage} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {formatPrice(product.price)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border ${stockStatus.color}`}
                >
                  {stockStatus.label} ({product.stock})
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => onEdit(product.id)}
                className="p-2 text-gray-400 hover:text-[#C19A6B]"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
