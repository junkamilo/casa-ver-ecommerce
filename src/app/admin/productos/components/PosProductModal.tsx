"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Loader2, Info } from "lucide-react";
import {
  BadgePercent,
  FlameIcon,
  LightbulbIcon,
  PackageOpen,
  SaveIcon,
  SparklesIcon,
} from "@/components/icons";
import type { AdminProductDetailDTO } from "@/modules/adminCatalog/products/presentation/mappers";
import {
  AdminProductsApiError,
  updatePosManagedProduct,
} from "@/modules/adminCatalog/products/presentation/api-client";
import { formatPrice, inputCls } from "../constants";
import LabelToggle from "./form/LabelToggle";
import ProductCoverPicker from "./form/ProductCoverPicker";

interface PosProductModalProps {
  product: AdminProductDetailDTO | null;
  loading: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}

const nowIso = () => new Date().toISOString();

/**
 * Edición de un producto sincronizado desde el POS. Nombre, precio, categorías, tipos de prenda,
 * colores, tallas y disponibilidad vienen del POS y se muestran solo como referencia.
 */
export default function PosProductModal({
  product,
  loading,
  onClose,
  onSaved,
  onError,
}: PosProductModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isProductNew, setIsProductNew] = useState(false);
  const [isProductNewAt, setIsProductNewAt] = useState<string | null>(null);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isOnSaleAt, setIsOnSaleAt] = useState<string | null>(null);
  const [isSuggested, setIsSuggested] = useState(false);
  const [suggestedAt, setSuggestedAt] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    if (!product) return;
    setIsFeatured(product.isFeatured ?? false);
    setIsNew(product.isNew ?? false);
    setIsProductNew(product.isProductNew ?? false);
    setIsProductNewAt(product.isProductNewAt ?? null);
    setIsOnSale(product.isOnSale ?? false);
    setIsOnSaleAt(product.isOnSaleAt ?? null);
    setIsSuggested(product.isSuggested ?? false);
    setSuggestedAt(product.suggestedAt ?? null);
    setCoverImageUrl(product.coverImageUrl ?? "");
    setMetaTitle(product.metaTitle ?? "");
    setMetaDescription(product.metaDescription ?? "");
  }, [product]);

  const variantsByColor = useMemo(() => {
    const map = new Map<string, NonNullable<AdminProductDetailDTO["variants"]>>();
    for (const v of product?.variants ?? []) {
      if (v.isActive === false) continue;
      map.set(v.colorName, [...(map.get(v.colorName) ?? []), v]);
    }
    return [...map.entries()];
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    try {
      await updatePosManagedProduct(product.id, {
        isFeatured,
        isNew,
        isProductNew,
        isProductNewAt,
        isOnSale,
        isOnSaleAt,
        isSuggested,
        suggestedAt,
        coverImageUrl: coverImageUrl || null,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
      });
      onSaved("Producto actualizado");
    } catch (err: unknown) {
      onError(
        err instanceof AdminProductsApiError || err instanceof Error
          ? err.message
          : "Error al guardar el producto"
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
          <div>
            <h2 className="text-lg font-bold text-gray-900">Editar producto del POS</h2>
            {product?.posSyncedAt && (
              <p className="text-xs text-gray-400">
                Última sincronización: {new Date(product.posSyncedAt).toLocaleString("es-CO")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading || !product ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#154734]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="flex gap-3 rounded-xl border border-[#C19A6B]/30 bg-[#C19A6B]/5 p-4">
              <Info className="w-5 h-5 text-[#C19A6B] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Nombre, descripción, precio, categorías, colores, tallas, fotos y disponibilidad se
                administran en el POS y llegan solos a la web. Aquí solo se editan etiquetas,
                sugeridos, portada, tipos de prenda y SEO.
              </p>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Nombre</p>
                <p className="font-medium text-gray-900">{product.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Precio</p>
                <p className="font-medium text-gray-900">
                  {formatPrice(Number(product.basePrice ?? 0))}
                  {product.comparePrice ? (
                    <span className="ml-2 text-gray-400 line-through">
                      {formatPrice(Number(product.comparePrice))}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Categorías</p>
                <p className="text-gray-700">
                  {product.categoryNames?.join(", ") || "Sin categoría en el POS"}
                </p>
              </div>
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
                          key={v.id}
                          className={`px-2 py-0.5 rounded text-xs font-medium border ${
                            !v.posAvailable
                              ? "bg-red-50 text-red-700 border-red-200"
                              : v.posLowStock
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-green-50 text-green-700 border-green-200"
                          }`}
                          title={!v.posAvailable ? "Agotado" : v.posLowStock ? "Quedan pocas" : "Disponible"}
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
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Colecciones y Etiquetas
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <LabelToggle
                  active={isFeatured}
                  onToggle={() => setIsFeatured(!isFeatured)}
                  icon={FlameIcon}
                  label="Más Vendidos"
                  description="Aparece en sección Más Vendidos"
                  activeColor="text-amber-600"
                  activeBg="bg-amber-50"
                  activeBorder="border-amber-400"
                />
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
                  active={isProductNew}
                  onToggle={() => {
                    setIsProductNewAt(isProductNew ? null : nowIso());
                    setIsProductNew(!isProductNew);
                  }}
                  icon={SparklesIcon}
                  label="Producto Nuevo"
                  description="Muestra etiqueta roja · dura 7 días"
                  infoText="Etiqueta activa · expira en 7 días"
                  activeColor="text-red-600"
                  activeBg="bg-red-50"
                  activeBorder="border-red-400"
                />
                <LabelToggle
                  active={isOnSale}
                  onToggle={() => {
                    setIsOnSaleAt(isOnSale ? null : nowIso());
                    setIsOnSale(!isOnSale);
                  }}
                  icon={BadgePercent}
                  label="Producto en Oferta"
                  description="Muestra etiqueta dorada de oferta"
                  infoText="Etiqueta de oferta activa"
                  activeColor="text-[#C19A6B]"
                  activeBg="bg-[#C19A6B]/10"
                  activeBorder="border-[#C19A6B]"
                />
                <LabelToggle
                  active={isSuggested}
                  onToggle={() => {
                    setSuggestedAt(isSuggested ? null : nowIso());
                    setIsSuggested(!isSuggested);
                  }}
                  icon={LightbulbIcon}
                  label="Sugerir en popup"
                  description="Aparece en 'Te podría interesar'"
                  infoText="Sugerencia activa en popup"
                  activeColor="text-[#C19A6B]"
                  activeBg="bg-[#C19A6B]/10"
                  activeBorder="border-[#C19A6B]"
                />
              </div>
            </section>

            <ProductCoverPicker
              title="Portada del producto"
              helpText="Elige cuál de las fotos del POS se muestra como portada en la tienda."
              colors={product.colors ?? []}
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
        )}
      </div>
    </div>
  );
}
