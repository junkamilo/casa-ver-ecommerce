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
            className={`w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#C19A6B] hover:bg-[#FAFAFA] transition-all group ${aspectClass}`}
          >
            <div className="w-10 h-10 rounded-full bg-[#154734]/5 flex items-center justify-center mb-3 group-hover:bg-[#C19A6B]/10 transition-colors">
              <UploadCloud className="w-5 h-5 text-[#154734] group-hover:text-[#C19A6B] transition-colors" />
            </div>
            <span className="text-xs font-bold text-[#154734] group-hover:text-[#C19A6B] transition-colors uppercase tracking-widest">
              Subir Foto
            </span>
            <span className="text-[10px] text-gray-400 mt-1">JPG, PNG — máx. 5MB</span>
          </button>
        ) : (
          <div
            className={`relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group ${aspectClass}`}
          >
            <img
              src={image}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => open()}
                className="p-3 bg-white text-[#154734] hover:text-[#C19A6B] rounded-full shadow-xl hover:scale-110 transition-all"
                title="Cambiar imagen"
              >
                <UploadCloud className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setImage("")}
                className="p-3 bg-white text-gray-700 hover:text-red-600 rounded-full shadow-xl hover:scale-110 transition-all"
                title="Eliminar imagen"
              >
                <Trash2 className="w-5 h-5" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#154734]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFA]">
          <h2
            className="text-2xl text-[#154734] italic"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {mode === "edit" ? "Editar Colección" : "Nueva Colección"}
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:text-[#C19A6B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-8 space-y-8 max-h-[75vh] overflow-y-auto"
        >
          {/* Textos */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">Nombre de la Colección</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Prendas Inferiores"
                required
                className="w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-[#154734] font-medium"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">Descripción Editorial</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Un breve texto que inspire a tus clientes..."
                rows={3}
                className="w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none resize-none transition-all text-gray-600 font-light"
              />
            </div>
          </div>

          {/* Zonas de Imagen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-[#154734] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C19A6B]" />
                Miniatura (Card)
              </label>
              <p className="text-[11px] text-gray-400 font-light leading-relaxed">Esta imagen representará la categoría en la grilla principal. Formato cuadrado recomendado.</p>
              <ImageZone image={image} setImage={setImage} aspectClass="h-40" />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-[#154734] flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#C19A6B]" />
                Banner Editorial
              </label>
              <p className="text-[11px] text-gray-400 font-light leading-relaxed">Imagen panorámica (ancha) que se mostrará en la cabecera cuando el cliente entre a ver las prendas.</p>
              <ImageZone
                image={bannerImage}
                setImage={setBannerImage}
                aspectClass="h-40"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-[#154734] hover:bg-[#103a2a] rounded-xl shadow-lg hover:shadow-[#154734]/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "edit" ? "Guardar Cambios" : "Crear Colección"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
