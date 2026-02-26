"use client";

import { X, Loader2, ImageIcon, UploadCloud, Trash2, Layout } from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";

const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

const WIDGET_OPTIONS = {
  sources: ["local"] as const,
  multiple: false,
  resourceType: "image" as const,
  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
  maxFileSize: 5 * 1024 * 1024,
  styles: {
    palette: {
      window: "#FFFFFF",
      windowBorder: "#E5E7EB",
      tabIcon: "#154734",
      menuIcons: "#154734",
      textDark: "#111827",
      textLight: "#FFFFFF",
      link: "#C19A6B",
      action: "#154734",
      inactiveTabIcon: "#9CA3AF",
      error: "#EF4444",
      inProgress: "#154734",
      complete: "#10B981",
      sourceBg: "#F9FAFB",
    },
  },
};

interface ImageZoneProps {
  image: string;
  setImage: (v: string) => void;
  aspectClass: string;
}

function ImageZone({ image, setImage, aspectClass }: ImageZoneProps) {
  const handleSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (
      result?.info &&
      typeof result.info === "object" &&
      "secure_url" in result.info
    ) {
      setImage(result.info.secure_url as string);
    }
  };

  return (
    <CldUploadWidget
      uploadPreset={UPLOAD_PRESET}
      options={WIDGET_OPTIONS as any}
      onSuccess={handleSuccess}
    >
      {({ open }) =>
        !image ? (
          <button
            type="button"
            onClick={() => open()}
            className={`w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-[#C19A6B] hover:bg-[#C19A6B]/5 transition-all group ${aspectClass}`}
          >
            <UploadCloud className="w-7 h-7 text-gray-400 group-hover:text-[#C19A6B] mb-1.5 transition-colors" />
            <span className="text-xs font-medium text-gray-500 group-hover:text-[#C19A6B] transition-colors">
              Haz clic para subir
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              JPG, PNG, WEBP — máx. 5MB
            </span>
          </button>
        ) : (
          <div
            className={`relative rounded-xl overflow-hidden border border-gray-200 group ${aspectClass}`}
          >
            <img
              src={image}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => open()}
                className="p-2 bg-white text-gray-700 hover:text-[#C19A6B] rounded-full shadow-lg hover:scale-110 transition-all"
                title="Cambiar imagen"
              >
                <UploadCloud className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setImage("")}
                className="p-2 bg-white text-gray-700 hover:text-red-600 rounded-full shadow-lg hover:scale-110 transition-all"
                title="Eliminar imagen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      }
    </CldUploadWidget>
  );
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  image: string;
  setImage: (v: string) => void;
  bannerImage: string;
  setBannerImage: (v: string) => void;
  mode?: "create" | "edit";
}

const CategoryModal = ({
  isOpen,
  onClose,
  submitting,
  onSubmit,
  name,
  setName,
  description,
  setDescription,
  image,
  setImage,
  bannerImage,
  setBannerImage,
  mode = "create",
}: CategoryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2
            className="text-xl font-bold text-[#154734]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {mode === "edit" ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ropa Deportiva"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de la categoría..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#154734]" />
                Imagen Card
              </label>
              <p className="text-[10px] text-gray-400">Se muestra en el inicio</p>
              <ImageZone image={image} setImage={setImage} aspectClass="h-28" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-[#154734]" />
                Imagen Banner
              </label>
              <p className="text-[10px] text-gray-400">Portada de la colección</p>
              <ImageZone
                image={bannerImage}
                setImage={setBannerImage}
                aspectClass="h-28"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "edit" ? "Guardar Cambios" : "Crear Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
