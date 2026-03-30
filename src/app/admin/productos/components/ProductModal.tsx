import { useState } from "react";
import {
  X, Save, Loader2, Info, LayoutGrid, Tag, Package, Video,
} from "lucide-react";
import { Category, SelectedColor, SetItemForm } from "../types";
import {
  productFormSchema,
  setItemFormSchema,
  ProductFormErrors,
  ItemFormErrors,
} from "../schema";
import GeneralInfoSection from "./form/GeneralInfoSection";
import ColorsSection from "./form/ColorsSection";
import MaterialSection from "./form/MaterialSection";
import VideoSection from "./form/VideoSection";
import SetItemsSection from "./form/SetItemsSection";
import VariantStockSection from "./form/VariantStockSection";

interface Props {
  editingId: string | null;
  formLoading: boolean;
  submitting: boolean;
  categories: Category[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;

  name: string; setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  basePrice: string; setBasePrice: (v: string) => void;
  comparePrice: string; setComparePrice: (v: string) => void;
  stock: string; setStock: (v: string) => void;
  categoryId: string; setCategoryId: (v: string) => void;
  status: string; setStatus: (v: string) => void;
  isFeatured: boolean; setIsFeatured: (v: boolean) => void;
  isNew: boolean; setIsNew: (v: boolean) => void;
  isProductNew: boolean; setIsProductNew: (v: boolean) => void;
  isProductNewAt: string | null; setIsProductNewAt: (v: string | null) => void;
  isOnSale: boolean; setIsOnSale: (v: boolean) => void;
  isOnSaleAt: string | null; setIsOnSaleAt: (v: string | null) => void;
  material: string; setMaterial: (v: string) => void;
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  showMaterial: boolean; setShowMaterial: (v: boolean) => void;
  videoUrl: string; setVideoUrl: (v: string) => void;
  toggleColor: (name: string, hexCode: string) => void;
  toggleSize: (size: string) => void;
  setColorImages: (colorName: string, images: string[]) => void;

  updateVariantStock: (colorName: string, size: string, stock: number) => void;
  isSet: boolean; setIsSet: (v: boolean) => void;
  setItems: SetItemForm[];
  addSetItem: () => void;
  removeSetItem: (localId: string) => void;
  updateSetItem: (localId: string, updates: Partial<SetItemForm>) => void;
  toggleSetItemColor: (localId: string, name: string, hexCode: string) => void;
  toggleSetItemSize: (localId: string, size: string) => void;
  setSetItemColorImages: (localId: string, colorName: string, images: string[]) => void;
  updateSetItemVariantStock: (localId: string, colorName: string, size: string, stock: number) => void;
}

// ── Componente auxiliar: cabecera de bloque ────────────────────────────────
function BlockHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-[#154734]/8 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#154734]" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-sm mt-1">{msg}</p>;
}

const inputCls = (hasError = false) =>
  `w-full px-4 py-2.5 rounded-lg border ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#C19A6B] focus:ring-[#C19A6B]/10"
  } focus:ring-4 outline-none text-sm transition-colors`;

export default function ProductModal({
  editingId,
  formLoading,
  submitting,
  categories,
  onClose,
  onSubmit,
  name, setName,
  description, setDescription,
  basePrice, setBasePrice,
  comparePrice, setComparePrice,
  stock, setStock,
  categoryId, setCategoryId,
  status, setStatus,
  isFeatured, setIsFeatured,
  isNew, setIsNew,
  isProductNew, setIsProductNew,
  isProductNewAt, setIsProductNewAt,
  isOnSale, setIsOnSale,
  isOnSaleAt, setIsOnSaleAt,
  material, setMaterial,
  selectedColors,
  selectedSizes,
  showMaterial, setShowMaterial,
  videoUrl, setVideoUrl,
  toggleColor,
  toggleSize,
  setColorImages,
  updateVariantStock,
  isSet, setIsSet,
  setItems,
  addSetItem,
  removeSetItem,
  updateSetItem,
  toggleSetItemColor,
  toggleSetItemSize,
  setSetItemColorImages,
  updateSetItemVariantStock,
}: Props) {
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [itemErrors, setItemErrors] = useState<ItemFormErrors>({});

  const hasVariantStocks =
    selectedColors.some((c) => Object.keys(c.variantStocks || {}).length > 0);

  // Mostrar tabla de stock cuando hay colores Y tallas (en creación y edición)
  const shouldShowStockTable = selectedColors.length > 0 && selectedSizes.length > 0;

  const handleValidatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productResult = productFormSchema.safeParse({
      name,
      description,
      basePrice,
      comparePrice: comparePrice || undefined,
      // Cuando se muestran variantes, el stock se calcula desde variantStocks
      // Si no hay tabla de stock, se usa el stock general
      stock: shouldShowStockTable ? "0" : stock,
      categoryId,
      videoUrl: videoUrl || undefined,
    });

    const newErrors: ProductFormErrors = {};
    if (!productResult.success) {
      for (const issue of productResult.error.issues) {
        const field = issue.path[0] as keyof ProductFormErrors;
        if (field && !newErrors[field]) newErrors[field] = issue.message;
      }
    }

    const newItemErrors: ItemFormErrors = {};
    if (isSet) {
      for (const item of setItems) {
        const itemResult = setItemFormSchema.safeParse({
          name: item.name,
          price: item.price || undefined,
          comparePrice: item.comparePrice || undefined,
          videoUrl: item.videoUrl || undefined,
        });
        if (!itemResult.success) {
          const errs: ItemFormErrors[string] = {};
          for (const issue of itemResult.error.issues) {
            const field = issue.path[0] as keyof ItemFormErrors[string];
            if (field && !errs[field]) errs[field] = issue.message;
          }
          newItemErrors[item.localId] = errs;
        }
      }
    }

    setErrors(newErrors);
    setItemErrors(newItemErrors);

    const isValid =
      Object.keys(newErrors).length === 0 &&
      Object.keys(newItemErrors).length === 0;

    if (isValid) {
      onSubmit(e);
    }
  };

  const handleClose = () => {
    setErrors({});
    setItemErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-4xl bg-[#F8F9FA] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">

        {/* ── Modal Header ─────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2
              className="text-xl font-bold text-[#154734]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            {isSet && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#C19A6B] mt-0.5">
                <LayoutGrid className="w-3 h-3" /> Conjunto
              </span>
            )}
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        {formLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#154734]" />
          </div>
        ) : (
          <form onSubmit={handleValidatedSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">

              {/* ╔══════════════════════════════════════╗
                  ║  BLOQUE 1 — Información General      ║
                  ╚══════════════════════════════════════╝ */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <BlockHeader
                  icon={Info}
                  title="Información General"
                  subtitle="Nombre, descripción y categoría — aplican para todo el producto"
                />
                <GeneralInfoSection
                  name={name} onName={setName}
                  description={description} onDescription={setDescription}
                  categoryId={categoryId} onCategory={setCategoryId}
                  status={status} onStatus={setStatus}
                  isFeatured={isFeatured} onFeatured={setIsFeatured}
                  isNew={isNew} onNew={setIsNew}
                  isProductNew={isProductNew} onProductNew={setIsProductNew}
                  isProductNewAt={isProductNewAt} onProductNewAt={setIsProductNewAt}
                  isOnSale={isOnSale} onOnSale={setIsOnSale}
                  isOnSaleAt={isOnSaleAt} onOnSaleAt={setIsOnSaleAt}
                  categories={categories}
                  errors={errors}
                />
              </div>

              {/* ╔══════════════════════════════════════╗
                  ║  BLOQUE 2 — Tipo de Producto         ║
                  ╚══════════════════════════════════════╝ */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C19A6B]/10 flex items-center justify-center shrink-0">
                      <LayoutGrid className="w-5 h-5 text-[#C19A6B]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        ¿Este producto tiene piezas separadas?
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Activa para añadir subcategorías comprables por separado (ej: Short, Pantalón, Blusa)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSet(!isSet)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none shadow-inner ${
                      isSet ? "bg-[#154734]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                        isSet ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Indicador visual del modo activo */}
                <div className="mt-4 flex gap-3 transition-all duration-300">
                  <div className={`flex-1 rounded-xl border-2 px-4 py-3 text-center transition-all ${
                    !isSet
                      ? "border-[#154734] bg-[#154734]/5"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}>
                    <Tag className={`w-4 h-4 mx-auto mb-1 ${!isSet ? "text-[#154734]" : "text-gray-400"}`} />
                    <p className={`text-xs font-bold ${!isSet ? "text-[#154734]" : "text-gray-400"}`}>
                      Producto Simple
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Un único ítem con colores y tallas</p>
                  </div>
                  <div className={`flex-1 rounded-xl border-2 px-4 py-3 text-center transition-all ${
                    isSet
                      ? "border-[#C19A6B] bg-[#C19A6B]/5"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}>
                    <LayoutGrid className={`w-4 h-4 mx-auto mb-1 ${isSet ? "text-[#C19A6B]" : "text-gray-400"}`} />
                    <p className={`text-xs font-bold ${isSet ? "text-[#C19A6B]" : "text-gray-400"}`}>
                      Con Subcategorías
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Subcategorías comprables de forma independiente</p>
                  </div>
                </div>
              </div>

              {/* ╔══════════════════════════════════════╗
                  ║  BLOQUE 3 — Precio, Stock e Inventario║
                  ║  (siempre visible — datos del padre)  ║
                  ╚══════════════════════════════════════╝ */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <BlockHeader
                  icon={Package}
                  title="Precio, Inventario y Multimedia"
                  subtitle={
                    isSet
                      ? "Datos del producto principal — siempre requeridos independientemente de las subcategorías"
                      : "Configura el precio, stock, colores disponibles y material visual"
                  }
                />
                <div className="space-y-6">
                  {/* Precio y Stock */}
                  <div className={`grid grid-cols-1 gap-4 ${shouldShowStockTable ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Precio (COP) *
                      </label>
                      <input
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="89900"
                        min="0"
                        className={inputCls(!!errors.basePrice)}
                      />
                      <FieldError msg={errors.basePrice} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Precio Antes <span className="font-normal text-gray-400 normal-case tracking-normal">(tachado)</span>
                      </label>
                      <input
                        type="number"
                        value={comparePrice}
                        onChange={(e) => setComparePrice(e.target.value)}
                        placeholder="120000"
                        min="0"
                        className={inputCls(!!errors.comparePrice)}
                      />
                      <FieldError msg={errors.comparePrice} />
                    </div>
                  </div>

                  {/* Colores, Imágenes por color y Tallas */}
                  <ColorsSection
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    disabled={submitting}
                    onToggleColor={toggleColor}
                    onToggleSize={toggleSize}
                    onSetColorImages={setColorImages}
                  />

                  {/* Stock por variante — aparece debajo de tallas cuando hay colores Y tallas */}
                  {shouldShowStockTable && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Stock por Variante
                      </p>
                      <VariantStockSection
                        selectedColors={selectedColors}
                        selectedSizes={selectedSizes}
                        disabled={submitting}
                        productId={editingId || undefined}
                        onUpdate={updateVariantStock}
                      />
                    </div>
                  )}

                  {/* Video */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Video del Producto{" "}
                        <span className="font-normal text-gray-400 normal-case tracking-normal">— opcional</span>
                      </p>
                    </div>
                    <VideoSection
                      videoUrl={videoUrl}
                      onVideoUrl={setVideoUrl}
                      disabled={submitting}
                    />
                    <FieldError msg={errors.videoUrl} />
                  </div>
                </div>
              </div>

              {/* ╔══════════════════════════════════════╗
                  ║  BLOQUE 4 — Subcategorías            ║
                  ║  (solo visible cuando isSet=true)    ║
                  ╚══════════════════════════════════════╝ */}
              {isSet && (
                <div className="bg-white rounded-2xl border border-[#C19A6B]/30 shadow-sm p-6">
                  <BlockHeader
                    icon={LayoutGrid}
                    title="Subcategorías"
                    subtitle="Cada subcategoría tiene su propio precio, stock, descripción, colores, imágenes y video — comprables de forma independiente"
                  />
                  <SetItemsSection
                    items={setItems}
                    disabled={submitting}
                    itemErrors={itemErrors}
                    onAdd={addSetItem}
                    onRemove={removeSetItem}
                    onUpdate={updateSetItem}
                    onToggleColor={toggleSetItemColor}
                    onToggleSize={toggleSetItemSize}
                    onSetColorImages={setSetItemColorImages}
                    onUpdateVariantStock={updateSetItemVariantStock}
                  />
                </div>
              )}

              {/* ╔══════════════════════════════════════╗
                  ║  BLOQUE 5 — Material y Cuidado       ║
                  ╚══════════════════════════════════════╝ */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <MaterialSection
                  show={showMaterial}
                  onToggle={() => setShowMaterial(!showMaterial)}
                  material={material} onMaterial={setMaterial}
                />
              </div>
            </div>

            {/* ── Footer ───────────────────────────────────────── */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between gap-3 sticky bottom-0 z-10">
              <p className="text-xs text-gray-400">
                {isSet
                  ? `Con subcategorías · ${setItems.length} subcategoría${setItems.length !== 1 ? "s" : ""}`
                  : "Producto simple"}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingId ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
