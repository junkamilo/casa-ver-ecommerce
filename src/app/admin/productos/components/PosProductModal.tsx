"use client";

import { useMemo, useState } from "react";
import { X, Loader2, Info } from "lucide-react";
import { BadgePercent, PackageOpen, SaveIcon } from "@/components/icons";
import type { ProductListItem } from "../types";
import {
  AdminProductsApiError,
  updatePosManagedProduct,
} from "@/modules/adminCatalog/products/presentation/api-client";
import { formatPrice, inputCls } from "../constants";
import LabelToggle from "./form/LabelToggle";
import ProductCoverPicker from "./form/ProductCoverPicker";

interface PosProductModalProps {
  product: ProductListItem;
  onClose: () => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}

/**
 * Capa web de un producto del POS (`product_web_settings`, por slug): Nueva colección, oferta manual, portada
 * y SEO. Nombre, precio, categorías, colores, tallas, fotos, inventario y las etiquetas del POS se muestran
 * solo como referencia.
 */
export default function PosProductModal({ product, onClose, onSaved, onError }: PosProductModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [isNew, setIsNew] = useState(product.web.isNew);
  const [isOnSale, setIsOnSale] = useState(product.web.isOnSale);
  const [coverImageUrl, setCoverImageUrl] = useState(product.web.coverImageUrl ?? "");
  const [metaTitle, setMetaTitle] = useState(product.web.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(product.web.metaDescription ?? "");

  const variantsByColor = useMemo(() => {
    const map = new Map<string, ProductListItem["variants"]>();
    for (const v of product.variants) map.set(v.colorName, [...(map.get(v.colorName) ?? []), v]);
    return [...map.entries()];
  }, [product]);

  const posLabels = [
    product.labels.bestSeller && "Más vendidos",
    product.labels.productNew && "Producto nuevo",
    product.labels.onSale && "Oferta",
    product.labels.suggested && "Sugerido en popup",
  ].filter((l): l is string => Boolean(l));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updatePosManagedProduct(product.slug, {
        isNew,
        isOnSale,
        coverImageUrl: coverImageUrl || null,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
      });
      onSaved("Producto actualizado");
    } catch (err: unknown) {
      onError(
        err instanceof AdminProductsApiError || err instanceof Error ? err.message : "Error al guardar el producto"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{product.name}</h2>
            <p className="text-xs text-gray-400">{product.slug}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="flex gap-3 rounded-xl border border-[#C19A6B]/30 bg-[#C19A6B]/5 p-4">
            <Info className="w-5 h-5 text-[#C19A6B] shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Nombre, descripción, precio, categorías, colores, tallas, fotos, inventario y las etiquetas Más
              vendidos, Producto nuevo, Oferta y Sugerido se administran en el POS y llegan solos a la tienda.
            </p>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Precio</p>
              <p className="font-medium text-gray-900">
                {formatPrice(product.salePrice)}
                {product.displayPrice && product.displayPrice > product.salePrice ? (
                  <span className="ml-2 text-gray-400 line-through">{formatPrice(product.displayPrice)}</span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Etiquetas del POS</p>
              <p className="text-gray-700">{posLabels.join(", ") || "Ninguna"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Categorías</p>
              <p className="text-gray-700">{product.categoryNames.join(", ") || "Sin categoría en el POS"}</p>
            </div>
            {product.components.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Piezas del conjunto</p>
                <p className="text-gray-700">{product.components.join(", ")}</p>
              </div>
            )}
            <div className="sm:col-span-2 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Disponibilidad</p>
              {variantsByColor.length === 0 ? (
                <p className="text-gray-400 italic">Sin variantes</p>
              ) : (
                variantsByColor.map(([colorName, variants]) => (
                  <div key={colorName} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-700 mr-1">{colorName}:</span>
                    {variants.map((v) => (
                      <span
                        key={`${colorName}-${v.size}`}
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${
                          !v.available
                            ? "bg-red-50 text-red-700 border-red-200"
                            : v.lowStock
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-green-50 text-green-700 border-green-200"
                        }`}
                        title={!v.available ? "Agotado" : v.lowStock ? "En su mínimo" : "Disponible"}
                      >
                        {v.size}
                      </span>
                    ))}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-2.5">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Colecciones de la web</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <LabelToggle
                active={isNew}
                onToggle={() => setIsNew(!isNew)}
                icon={PackageOpen}
                label="Nuevos Ingresos"
                description="Aparece en Nueva Colección"
                activeColor="text-[#154734]"
                activeBg="bg-[#154734]/5"
                activeBorder="border-[#154734]"
              />
              <LabelToggle
                active={isOnSale}
                onToggle={() => setIsOnSale(!isOnSale)}
                icon={BadgePercent}
                label="Oferta manual"
                description="Etiqueta de oferta aunque el POS no la tenga"
                infoText="Etiqueta de oferta activa"
                activeColor="text-[#C19A6B]"
                activeBg="bg-[#C19A6B]/10"
                activeBorder="border-[#C19A6B]"
              />
            </div>
          </section>

          <ProductCoverPicker
            title="Portada del producto"
            helpText="Elige cuál de las fotos del POS se muestra como portada en la tienda."
            colors={product.colors}
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            disabled={submitting}
          />

          <section className="space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">SEO</p>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Título ({metaTitle.length}/70)</label>
              <input
                type="text"
                value={metaTitle}
                maxLength={70}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={inputCls()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Descripción ({metaDescription.length}/170)</label>
              <textarea
                value={metaDescription}
                maxLength={170}
                rows={3}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={inputCls()}
              />
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon size={16} />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
