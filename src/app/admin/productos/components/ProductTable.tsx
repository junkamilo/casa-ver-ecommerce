import Image from "next/image";
import { Loader2 } from "lucide-react";
import { EditIcon } from "@/components/icons";
import type { ProductListItem } from "../types";
import { formatPrice } from "../constants";
import SectionEmptyState from "@/components/ui/SectionEmptyState";

interface ProductTableProps {
  products: ProductListItem[];
  loading: boolean;
  onEdit: (product: ProductListItem) => void;
}

function stockBadge(product: ProductListItem) {
  if (!product.available) return { label: "Agotado", color: "bg-red-100 text-red-700 border-red-200" };
  if (product.outOfStockCount > 0 || product.lowStockCount > 0) {
    const parts = [
      product.outOfStockCount > 0 ? `${product.outOfStockCount} agotada${product.outOfStockCount > 1 ? "s" : ""}` : null,
      product.lowStockCount > 0 ? `${product.lowStockCount} en mínimo` : null,
    ].filter(Boolean);
    return { label: parts.join(" · "), color: "bg-amber-100 text-amber-700 border-amber-200" };
  }
  return { label: "En stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}

function Labels({ product }: { product: ProductListItem }) {
  const labels = [
    product.labels.bestSeller && "Más vendidos",
    product.web.isNew && "Nueva colección",
    product.labels.productNew && "Nuevo",
    (product.labels.onSale || product.web.isOnSale) && "Oferta",
    product.labels.suggested && "Sugerido",
    product.components.length > 0 && "Conjunto",
  ].filter((l): l is string => Boolean(l));
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {labels.map((label) => (
        <span
          key={label}
          className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#C19A6B]/15 text-[#8a6a43]"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function Thumb({ product }: { product: ProductListItem }) {
  return (
    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0">
      {product.coverImageUrl ? (
        <Image src={product.coverImageUrl} alt={product.name} fill className="object-cover" sizes="48px" />
      ) : (
        <div className="w-full h-full bg-gray-200" />
      )}
    </div>
  );
}

function Price({ product }: { product: ProductListItem }) {
  return (
    <span className="text-sm font-semibold text-gray-900">
      {formatPrice(product.salePrice)}
      {product.displayPrice && product.displayPrice > product.salePrice ? (
        <span className="ml-2 text-xs text-gray-400 line-through">{formatPrice(product.displayPrice)}</span>
      ) : null}
    </span>
  );
}

/** Productos que publica el POS (solo lectura) con acceso a su capa web. */
export default function ProductTable({ products, loading, onEdit }: ProductTableProps) {
  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <SectionEmptyState message="No hay productos publicados por el POS con estos filtros." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:block overflow-auto max-h-150">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-gray-200">
              {["Producto", "Categoría", "Precio", "Stock", "Web"].map((h, i) => (
                <th
                  key={h}
                  className={`sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-xs font-bold text-gray-500 uppercase shadow-[0_1px_0_0_rgba(229,231,235,1)] ${
                    i === 4 ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const stock = stockBadge(product);
              return (
                <tr key={product.slug} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Thumb product={product} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.slug}</p>
                        <Labels product={product} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.categoryNames.join(", ") || <span className="text-gray-400">Sin categoría</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Price product={product} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${stock.color}`}>
                      {stock.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#154734] hover:bg-[#154734]/10 transition-colors"
                      title="Nueva colección, oferta manual, portada y SEO"
                    >
                      <EditIcon size={14} />
                      Capa web
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="md:hidden divide-y divide-gray-100">
        {products.map((product) => {
          const stock = stockBadge(product);
          return (
            <li key={product.slug} className="flex items-start gap-3 p-4">
              <Thumb product={product} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                <Price product={product} />
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stock.color}`}>
                    {stock.label}
                  </span>
                </div>
                <Labels product={product} />
              </div>
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="shrink-0 p-2 rounded-lg text-[#154734] hover:bg-[#154734]/10"
                aria-label={`Capa web de ${product.name}`}
              >
                <EditIcon size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
