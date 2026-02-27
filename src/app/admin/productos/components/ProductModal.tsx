import { X, Save, Loader2, LayoutGrid } from "lucide-react";
import { Category, SelectedColor, SetItemForm } from "../types";
import GeneralInfoSection from "./form/GeneralInfoSection";
import ColorsSection from "./form/ColorsSection";
import MaterialSection from "./form/MaterialSection";
import VideoSection from "./form/VideoSection";
import SetItemsSection from "./form/SetItemsSection";

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
  material: string; setMaterial: (v: string) => void;
  careInfo: string; setCareInfo: (v: string) => void;
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  showMaterial: boolean; setShowMaterial: (v: boolean) => void;
  videoUrl: string; setVideoUrl: (v: string) => void;
  toggleColor: (name: string, hexCode: string) => void;
  toggleSize: (size: string) => void;
  setColorImages: (colorName: string, images: string[]) => void;

  // Set
  isSet: boolean; setIsSet: (v: boolean) => void;
  setItems: SetItemForm[];
  addSetItem: () => void;
  removeSetItem: (localId: string) => void;
  updateSetItem: (localId: string, updates: Partial<SetItemForm>) => void;
  toggleSetItemColor: (localId: string, name: string, hexCode: string) => void;
  toggleSetItemSize: (localId: string, size: string) => void;
  setSetItemColorImages: (localId: string, colorName: string, images: string[]) => void;
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
  stock, setStock,
  categoryId, setCategoryId,
  status, setStatus,
  isFeatured, setIsFeatured,
  isNew, setIsNew,
  material, setMaterial,
  careInfo, setCareInfo,
  selectedColors,
  selectedSizes,
  showMaterial, setShowMaterial,
  videoUrl, setVideoUrl,
  toggleColor,
  toggleSize,
  setColorImages,
  isSet, setIsSet,
  setItems,
  addSetItem,
  removeSetItem,
  updateSetItem,
  toggleSetItemColor,
  toggleSetItemSize,
  setSetItemColorImages,
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
                stock={stock} onStock={setStock}
                categoryId={categoryId} onCategory={setCategoryId}
                status={status} onStatus={setStatus}
                isFeatured={isFeatured} onFeatured={setIsFeatured}
                isNew={isNew} onNew={setIsNew}
                categories={categories}
              />

              {/* Toggle: ¿Es un conjunto? */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#154734]/10 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-[#154734]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Producto compuesto (Conjunto)</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Activa para agregar piezas individuales (ej: Short + Pantalón)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSet(!isSet)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    isSet ? "bg-[#154734]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isSet ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Sección condicional según tipo */}
              {isSet ? (
                <SetItemsSection
                  items={setItems}
                  disabled={submitting}
                  onAdd={addSetItem}
                  onRemove={removeSetItem}
                  onUpdate={updateSetItem}
                  onToggleColor={toggleSetItemColor}
                  onToggleSize={toggleSetItemSize}
                  onSetColorImages={setSetItemColorImages}
                />
              ) : (
                <>
                  <ColorsSection
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    disabled={submitting}
                    onToggleColor={toggleColor}
                    onToggleSize={toggleSize}
                    onSetColorImages={setColorImages}
                  />
                  <VideoSection
                    videoUrl={videoUrl}
                    onVideoUrl={setVideoUrl}
                    disabled={submitting}
                  />
                </>
              )}

              <MaterialSection
                show={showMaterial}
                onToggle={() => setShowMaterial(!showMaterial)}
                material={material} onMaterial={setMaterial}
                careInfo={careInfo} onCareInfo={setCareInfo}
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
