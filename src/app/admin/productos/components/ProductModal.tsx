import { X, Save, Loader2 } from "lucide-react";
import { Category, ColorForm, VariantForm } from "../types";
import GeneralInfoSection from "./form/GeneralInfoSection";
import ImagesSection from "./form/ImagesSection";
import ColorsSection from "./form/ColorsSection";
import MaterialSection from "./form/MaterialSection";
import SeoSection from "./form/SeoSection";

interface Props {
  editingId: string | null;
  formLoading: boolean;
  submitting: boolean;
  categories: Category[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;

  // form fields (forwarded from useProductForm)
  name: string; setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  basePrice: string; setBasePrice: (v: string) => void;
  comparePrice: string; setComparePrice: (v: string) => void;
  categoryId: string; setCategoryId: (v: string) => void;
  status: string; setStatus: (v: string) => void;
  isFeatured: boolean; setIsFeatured: (v: boolean) => void;
  isNew: boolean; setIsNew: (v: boolean) => void;
  material: string; setMaterial: (v: string) => void;
  careInfo: string; setCareInfo: (v: string) => void;
  metaTitle: string; setMetaTitle: (v: string) => void;
  metaDescription: string; setMetaDescription: (v: string) => void;
  generalImages: string[];
  setGeneralImages: React.Dispatch<React.SetStateAction<string[]>>;
  colors: ColorForm[];
  showSEO: boolean; setShowSEO: (v: boolean) => void;
  showMaterial: boolean; setShowMaterial: (v: boolean) => void;

  // color helpers
  addColor: () => void;
  removeColor: (tempId: string) => void;
  updateColor: (tempId: string, field: keyof ColorForm, value: string | string[]) => void;
  addColorImage: (tempId: string, url: string) => void;
  removeColorImage: (tempId: string, url: string) => void;
  updateVariant: (tempId: string, size: string, field: keyof VariantForm, value: string) => void;
}

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
  categoryId, setCategoryId,
  status, setStatus,
  isFeatured, setIsFeatured,
  isNew, setIsNew,
  material, setMaterial,
  careInfo, setCareInfo,
  metaTitle, setMetaTitle,
  metaDescription, setMetaDescription,
  generalImages, setGeneralImages,
  colors,
  showSEO, setShowSEO,
  showMaterial, setShowMaterial,
  addColor,
  removeColor,
  updateColor,
  addColorImage,
  removeColorImage,
  updateVariant,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2
            className="text-xl font-bold text-[#154734]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {editingId ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        {formLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#154734]" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              <GeneralInfoSection
                name={name} onName={setName}
                description={description} onDescription={setDescription}
                basePrice={basePrice} onBasePrice={setBasePrice}
                comparePrice={comparePrice} onComparePrice={setComparePrice}
                categoryId={categoryId} onCategory={setCategoryId}
                status={status} onStatus={setStatus}
                isFeatured={isFeatured} onFeatured={setIsFeatured}
                isNew={isNew} onNew={setIsNew}
                categories={categories}
              />

              <ImagesSection
                images={generalImages}
                disabled={submitting}
                onAdd={(url) => setGeneralImages((prev) => [...prev, url])}
                onRemove={(url) => setGeneralImages((prev) => prev.filter((i) => i !== url))}
              />

              <ColorsSection
                colors={colors}
                disabled={submitting}
                onAdd={addColor}
                onRemove={removeColor}
                onUpdate={updateColor}
                onAddImage={addColorImage}
                onRemoveImage={removeColorImage}
                onUpdateVariant={updateVariant}
              />

              <MaterialSection
                show={showMaterial}
                onToggle={() => setShowMaterial(!showMaterial)}
                material={material} onMaterial={setMaterial}
                careInfo={careInfo} onCareInfo={setCareInfo}
              />

              <SeoSection
                show={showSEO}
                onToggle={() => setShowSEO(!showSEO)}
                metaTitle={metaTitle} onMetaTitle={setMetaTitle}
                metaDescription={metaDescription} onMetaDescription={setMetaDescription}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
