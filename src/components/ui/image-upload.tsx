"use client";

import { useCallback, useState, useRef } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Loader2, AlertTriangle, X } from "lucide-react";

// Tipos de imagen permitidos
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = ".jpg, .jpeg, .png, .webp, .gif";
const MAX_FILE_SIZE_MB = 5;

interface ImageUploadProps {
  value: string[];
  disabled?: boolean;
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
  maxImages?: number;
}

interface UploadingFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: "uploading" | "error";
  errorMessage?: string;
}

export default function ImageUpload({
  value,
  disabled,
  onChange,
  onRemove,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = maxImages - value.length - uploadingFiles.length;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" no es un formato valido. Solo se permiten: ${ALLOWED_EXTENSIONS}`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" supera el limite de ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      throw new Error("Error al subir imagen a Cloudinary");
    }

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error("No se recibio URL de Cloudinary");
    }

    return data.secure_url;
  };

  const removeUploadingFile = useCallback((id: string) => {
    setUploadingFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setError(null);

      const fileArray = Array.from(files);

      // Validar cantidad
      if (fileArray.length > remainingSlots) {
        setError(
          `Solo puedes subir ${remainingSlots} imagen(es) mas. Maximo permitido: ${maxImages}`
        );
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      // Validar cada archivo
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          validationErrors.push(validationError);
        } else {
          validFiles.push(file);
        }
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join(". "));
        if (inputRef.current) inputRef.current.value = "";
        if (validFiles.length === 0) return;
      }

      // Crear previews locales para archivos validos
      const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: "uploading" as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Subir cada archivo en paralelo
      for (const uploadingFile of newUploadingFiles) {
        try {
          const url = await uploadToCloudinary(uploadingFile.file);
          // Exito: remover de uploadingFiles y agregar URL real
          setUploadingFiles((prev) => {
            const file = prev.find((f) => f.id === uploadingFile.id);
            if (file) URL.revokeObjectURL(file.previewUrl);
            return prev.filter((f) => f.id !== uploadingFile.id);
          });
          onChange(url);
        } catch {
          // Error: marcar como error en la preview
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadingFile.id
                ? { ...f, progress: "error", errorMessage: "Error al subir" }
                : f
            )
          );
        }
      }

      if (inputRef.current) inputRef.current.value = "";
    },
    [onChange, remainingSlots, maxImages]
  );

  return (
    <div className="space-y-3">
      {/* Mensaje de error general */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-0.5 hover:bg-red-100 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contador */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {value.length} de {maxImages} imagenes
        </span>
        {value.length > 0 && (
          <span className="text-[#C19A6B] font-medium">
            La primera imagen sera la portada
          </span>
        )}
      </div>

      {/* Grid de imagenes */}
      <div className="flex flex-wrap gap-3">
        {/* Imagenes ya subidas */}
        {value.map((url, index) => (
          <div
            key={url}
            className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 group hover:border-[#C19A6B] transition-colors"
          >
            <Image
              src={url}
              alt={`Imagen ${index + 1}`}
              fill
              className="object-cover"
            />

            {/* Badge de portada */}
            {index === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-[#154734]/80 text-white text-[9px] font-bold text-center py-0.5">
                PORTADA
              </span>
            )}

            {/* Boton eliminar */}
            <button
              type="button"
              onClick={() => onRemove(url)}
              disabled={disabled}
              className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Imagenes subiendo (preview local) */}
        {uploadingFiles.map((file) => (
          <div
            key={file.id}
            className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 ${
              file.progress === "error"
                ? "border-red-300"
                : "border-[#C19A6B] border-dashed"
            }`}
          >
            {/* Preview local */}
            <Image
              src={file.previewUrl}
              alt="Subiendo..."
              fill
              className={`object-cover ${
                file.progress === "uploading" ? "opacity-50" : "opacity-40"
              }`}
            />

            {/* Overlay de estado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {file.progress === "uploading" ? (
                <>
                  <Loader2 className="w-5 h-5 text-[#C19A6B] animate-spin" />
                  <span className="text-[9px] font-medium text-gray-600 mt-1">
                    Subiendo...
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-[9px] font-medium text-red-600 mt-1">
                    Error
                  </span>
                </>
              )}
            </div>

            {/* Boton cancelar/remover */}
            <button
              type="button"
              onClick={() => removeUploadingFile(file.id)}
              className="absolute top-1 right-1 p-1 bg-gray-800/70 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Boton para agregar mas */}
        {remainingSlots > 0 && (
          <label
            className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#C19A6B] hover:bg-[#C19A6B]/5 transition-all ${
              disabled ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <ImagePlus className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] text-gray-400 mt-1">
              {value.length === 0 ? "Subir fotos" : "Agregar"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS}
              multiple
              className="hidden"
              disabled={disabled}
              onChange={handleUpload}
            />
          </label>
        )}
      </div>

      {/* Info de formatos */}
      <p className="text-[10px] text-gray-400">
        Formatos: JPG, PNG, WEBP, GIF. Max {MAX_FILE_SIZE_MB}MB por imagen.
      </p>
    </div>
  );
}
