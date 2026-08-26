import { useState, useRef } from "react";
import {
  X, Save, Loader2, Info, LayoutGrid, Tag, Package, Video,
} from "lucide-react";
import { ProductModalProps, ProductFormErrors, ItemFormErrors } from "../types";
import {
  productFormSchema,
  setProductFormSchema,
  setItemFormSchema,
} from "../schemas";
import { inputCls } from "../constants";
import BlockHeader from "./shared/BlockHeader";
import FieldError from "./shared/FieldError";
import PriceInput from "./shared/PriceInput";
import GeneralInfoSection from "./form/GeneralInfoSection";
import ColorsSection from "./form/ColorsSection";
import VideoSection from "./form/VideoSection";
import SetItemsSection from "./form/SetItemsSection";
import VariantStockSection from "./form/VariantStockSection";

export default function ProductModal({
  editingId,
  formLoading,
  submitting,
  categories,
  presetColors,
  onClose,
  onSubmit,
  name, setName,
  description, setDescription,
  basePrice, setBasePrice,
  comparePrice, setComparePrice,
  stock,
  categoryIds, setCategoryIds,
  status, setStatus,
  isFeatured, setIsFeatured,
  isNew, setIsNew,
  isProductNew, setIsProductNew,
  isProductNewAt, setIsProductNewAt,
  isOnSale, setIsOnSale,
  isOnSaleAt, setIsOnSaleAt,
  isSuggested, setIsSuggested,
  suggestedAt, setSuggestedAt,
  garmentTypes, setGarmentTypes,
  selectedColors,
  selectedSizes,
  videoUrl, setVideoUrl,
  coverImageUrl, setCoverImageUrl,
  toggleColor,
  toggleSize,
  setColorImages,
  updateVariantStock,
  isSet, setIsSet,
  setItems,
  addSetItem,
  removeSetItem,
  updateSetItem,
  featureSetItemForHome,
  toggleSetItemColor,
  toggleSetItemSize,
  setSetItemColorImages,
  updateSetItemVariantStock,
}: ProductModalProps) {
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [itemErrors, setItemErrors] = useState<ItemFormErrors>({});
  const [colorError, setColorError] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [colorImagesError, setColorImagesError] = useState<string | null>(null);
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const [noItemsError, setNoItemsError] = useState<string | null>(null);

  // Contenedor scrolleable del modal — se pasa a ImageUpload para que el
  // IntersectionObserver de videos use este contenedor como root en lugar del viewport.
  const [scrollEl, setScrollEl] = useState<HTMLFormElement | null>(null);

  // Contador de uploads activos — bloquea el submit mientras haya archivos en curso
  const uploadingCountRef = useRef(0);
  const [isUploading, setIsUploading] = useState(false);
  const handleUploadingChange = (active: boolean) => {
    uploadingCountRef.current = Math.max(0, uploadingCountRef.current + (active ? 1 : -1));
    setIsUploading(uploadingCountRef.current > 0);
  };

  const shouldShowStockTable = selectedColors.length > 0 && selectedSizes.length > 0;

  const handleValidatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ── 1. Validar campos del producto padre ──────────────────────────────────
    const schema = isSet ? setProductFormSchema : productFormSchema;
    const productResult = schema.safeParse({
      name,
      description,
      basePrice: basePrice || undefined,
      comparePrice: comparePrice || undefined,
      stock: shouldShowStockTable ? "0" : (stock || undefined),
      categoryIds,
      videoUrl: videoUrl || undefined,
    });

    const newErrors: ProductFormErrors = {};
    if (!productResult.success) {
      for (const issue of productResult.error.issues) {
        const field = issue.path[0] as keyof ProductFormErrors;
        if (field && !newErrors[field]) newErrors[field] = issue.message;
      }
    }

    // ── 2. Validar colores, tallas e imágenes del padre (solo productos simples) ─
    // Cuando isSet=true los colores viven en las subcategorías, no en el padre.
    const newColorError = !isSet && selectedColors.length === 0
      ? "Debes seleccionar al menos 1 color"
      : null;
    const newSizeError = !isSet && selectedSizes.length === 0
      ? "Debes seleccionar al menos 1 talla"
      : null;
    const newColorImagesError = !isSet && selectedColors.some((c) => c.images.length === 0)
      ? `Todos los colores deben tener al menos 1 foto (falta: ${selectedColors.filter((c) => c.images.length === 0).map((c) => c.name).join(", ")})`
      : null;
    const allColorUrls = selectedColors.flatMap((c) => c.images);
    const newCoverImageError =
      !isSet && allColorUrls.length > 0 && (!coverImageUrl || !allColorUrls.includes(coverImageUrl))
        ? "Elige la portada principal del producto entre las imágenes de los colores"
        : null;

    // ── 3. Validar subcategorías (solo si isSet) ──────────────────────────────
    const newItemErrors: ItemFormErrors = {};
    let newNoItemsError: string | null =
      isSet && setItems.length === 0
        ? "Debes agregar al menos 1 subcategoría"
        : null;

    if (isSet && setItems.length > 0) {
      for (const item of setItems) {
        const errs: ItemFormErrors[string] = {};

        // Zod: name, price, comparePrice, videoUrl
        const itemResult = setItemFormSchema.safeParse({
          name: item.name,
          price: item.price || undefined,
          comparePrice: item.comparePrice || undefined,
          videoUrl: item.videoUrl || undefined,
        });
        if (!itemResult.success) {
          for (const issue of itemResult.error.issues) {
            const field = issue.path[0] as keyof ItemFormErrors[string];
            if (field && !errs[field]) errs[field] = issue.message;
          }
        }

        // Colores y tallas requeridos en cada subcategoría
        if (item.colors.length === 0)
          errs.colors = "Debes seleccionar al menos 1 color";
        if (item.sizes.length === 0)
          errs.sizes = "Debes seleccionar al menos 1 talla";

        // Imágenes requeridas en cada color de la subcategoría
        const missingImgColors = item.colors.filter((c) => c.images.length === 0);
        if (missingImgColors.length > 0)
          errs.colorImages = `Foto requerida en: ${missingImgColors.map((c) => c.name).join(", ")}`;

        const itemUrls = item.colors.flatMap((c) => c.images);
        if (
          itemUrls.length > 0 &&
          (!item.coverImageUrl || !itemUrls.includes(item.coverImageUrl))
        ) {
          errs.coverImageUrl =
            "Elige la portada principal de la pieza entre las imágenes de sus colores";
        }

        if (Object.keys(errs).length > 0) newItemErrors[item.localId] = errs;
      }

      if (!setItems.some((item) => item.isCardFeatured)) {
        newNoItemsError =
          "Elige qué subcategoría se muestra en Home (check en el encabezado).";
      }
    }

    setErrors(newErrors);
    setItemErrors(newItemErrors);
    setColorError(newColorError);
    setSizeError(newSizeError);
    setColorImagesError(newColorImagesError);
    setCoverImageError(newCoverImageError);
    setNoItemsError(newNoItemsError);

    const isValid =
      Object.keys(newErrors).length === 0 &&
      Object.keys(newItemErrors).length === 0 &&
      !newColorError &&
      !newSizeError &&
      !newColorImagesError &&
      !newCoverImageError &&
      !newNoItemsError;

    if (isValid) {
      onSubmit(e);
    }
  };

  const handleClose = () => {
    setErrors({});
    setItemErrors({});
    setColorError(null);
    setSizeError(null);
    setColorImagesError(null);
    setCoverImageError(null);
    setNoItemsError(null);
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
          <form ref={setScrollEl} onSubmit={handleValidatedSubmit} className="flex-1 overflow-y-auto">
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
                  categoryIds={categoryIds} onCategories={setCategoryIds}
                  status={status} onStatus={setStatus}
                  isFeatured={isFeatured} onFeatured={setIsFeatured}
                  isNew={isNew} onNew={setIsNew}
                  isProductNew={isProductNew} onProductNew={setIsProductNew}
                  isProductNewAt={isProductNewAt} onProductNewAt={setIsProductNewAt}
                  isOnSale={isOnSale} onOnSale={setIsOnSale}
                  isOnSaleAt={isOnSaleAt} onOnSaleAt={setIsOnSaleAt}
                  isSuggested={isSuggested} onSuggested={setIsSuggested}
                  suggestedAt={suggestedAt} onSuggestedAt={setSuggestedAt}
                  garmentTypes={garmentTypes} onGarmentType={setGarmentTypes}
                  categories={categories}
                  errors={errors}
                  isSet={isSet}
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
                  ║  (oculto cuando isSet=true)           ║
                  ╚══════════════════════════════════════╝ */}
              {!isSet && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <BlockHeader
                    icon={Package}
                    title="Precio, Inventario y Multimedia"
                    subtitle="Configura el precio, stock, colores disponibles y material visual"
                  />
                  <div className="space-y-6">
                    <div className={`grid grid-cols-1 gap-4 ${shouldShowStockTable ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Precio (COP) *
                        </label>
                        <PriceInput
                          value={basePrice}
                          onChange={setBasePrice}
                          placeholder="89.900"
                          hasError={!!errors.basePrice}
                          className={inputCls(!!errors.basePrice)}
                        />
                        <FieldError msg={errors.basePrice} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Precio Antes <span className="font-normal text-gray-400 normal-case tracking-normal">(tachado)</span>
                        </label>
                        <PriceInput
                          value={comparePrice}
                          onChange={setComparePrice}
                          placeholder="120.000"
                          hasError={!!errors.comparePrice}
                          className={inputCls(!!errors.comparePrice)}
                        />
                        <FieldError msg={errors.comparePrice} />
                      </div>
                    </div>

                    <ColorsSection
                      selectedColors={selectedColors}
                      selectedSizes={selectedSizes}
                      disabled={submitting}
                      presetColors={presetColors}
                      onToggleColor={(name, hex) => { setColorError(null); toggleColor(name, hex); }}
                      onToggleSize={(size) => { setSizeError(null); toggleSize(size); }}
                      onSetColorImages={(colorName, images) => {
                        setColorImagesError(null);
                        setCoverImageError(null);
                        setColorImages(colorName, images);
                      }}
                      coverImageUrl={coverImageUrl}
                      onCoverImageUrl={(url) => {
                        setCoverImageError(null);
                        setCoverImageUrl(url);
                      }}
                      colorError={colorError}
                      sizeError={sizeError}
                      colorImagesError={colorImagesError}
                      coverImageError={coverImageError}
                      scrollContainer={scrollEl}
                      onUploadingChange={handleUploadingChange}
                    />

                    {shouldShowStockTable && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Stock por Variante
                        </p>
                        <VariantStockSection
                          selectedColors={selectedColors}
                          selectedSizes={selectedSizes}
                          disabled={submitting}
                          onUpdate={updateVariantStock}
                        />
                      </div>
                    )}

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
                        onUploadingChange={handleUploadingChange}
                      />
                      <FieldError msg={errors.videoUrl} />
                    </div>
                  </div>
                </div>
              )}

              {/* ╔══════════════════════════════════════╗
                  ║  BLOQUE 4 — Subcategorías            ║
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
                    presetColors={presetColors}
                    itemErrors={itemErrors}
                    noItemsError={noItemsError}
                    onAdd={() => { setNoItemsError(null); addSetItem(); }}
                    onRemove={removeSetItem}
                    onUpdate={updateSetItem}
                    onFeatureForHome={featureSetItemForHome}
                    onToggleColor={toggleSetItemColor}
                    onToggleSize={toggleSetItemSize}
                    onSetColorImages={setSetItemColorImages}
                    onUpdateVariantStock={updateSetItemVariantStock}
                    onUploadingChange={handleUploadingChange}
                    scrollContainer={scrollEl}
                  />
                </div>
              )}

            </div>

            {/* ── Footer ───────────────────────────────────────── */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between gap-3 sticky bottom-0 z-10">
              <p className="text-xs text-gray-400">
                {isUploading
                  ? "Subiendo archivos, espera…"
                  : isSet
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
                  disabled={submitting || isUploading}
                  title={isUploading ? "Espera a que terminen de subir los archivos" : undefined}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting || isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {submitting
                    ? (editingId ? "Guardando…" : "Creando…")
                    : isUploading
                      ? "Subiendo archivos…"
                      : editingId ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
