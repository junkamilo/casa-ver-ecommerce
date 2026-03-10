"use client";

import { useRef, useState } from "react";
import { Trash2, Upload, Loader2, PlayCircle } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg", ".mkv"];

function isVideo(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext)) || clean.includes("/video/");
}

interface MediaUploadProps {
  value: string[];
  disabled?: boolean;
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
  maxImages?: number;
}

export default function ImageUpload({
  value,
  disabled,
  onChange,
  onRemove,
  maxImages = 5,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ id: string; previewUrl: string; isVideo: boolean }[]>([]);

  const remaining = maxImages - value.length - uploading.length;

  const handleFiles = async (files: FileList) => {
    const toUpload = Array.from(files).slice(0, Math.max(0, remaining));
    if (!toUpload.length) return;

    const pending = toUpload.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video"),
      file,
    }));

    setUploading((prev) => [
      ...prev,
      ...pending.map(({ id, previewUrl, isVideo }) => ({ id, previewUrl, isVideo })),
    ]);

    const results = await Promise.allSettled(
      pending.map(async ({ id, file, previewUrl }) => {
        const resourceType = file.type.startsWith("video") ? "video" : "image";
        const url = await uploadToCloudinary(file, resourceType);
        URL.revokeObjectURL(previewUrl);
        setUploading((prev) => prev.filter((u) => u.id !== id));
        return url;
      })
    );

    const uploadedUrls = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);

    if (uploadedUrls.length) onChange(uploadedUrls);

    // Clean up failed previews
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        URL.revokeObjectURL(pending[i].previewUrl);
        setUploading((prev) => prev.filter((u) => u.id !== pending[i].id));
      }
    });
  };

  return (
    <div className="space-y-3">
      {remaining > 0 && !disabled && (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*,.heic,.heif"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#154734] hover:bg-[#154734]/5 transition-colors text-gray-500 hover:text-[#154734]"
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs font-medium">
              Subir archivos{" "}
              <span className="font-normal text-gray-400">(JPG, PNG, HEIC, MP4, MOV…)</span>
            </span>
            <span className="text-[10px] text-gray-400">
              Puedes seleccionar varios a la vez · máx {maxImages}
            </span>
          </button>
        </>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{value.length + uploading.length} de {maxImages} archivos</span>
        {value.length > 0 && (
          <span className="text-[#C19A6B] font-medium">El primer archivo será la portada</span>
        )}
      </div>

      {(value.length > 0 || uploading.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 group hover:border-[#C19A6B] transition-colors bg-gray-100"
            >
              {isVideo(url) ? (
                <>
                  <video src={url} muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <PlayCircle className="w-7 h-7 text-white drop-shadow" />
                  </div>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`Archivo ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
              )}

              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#154734]/80 text-white text-[9px] font-bold text-center py-0.5">
                  PORTADA
                </span>
              )}

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

          {uploading.map(({ id, previewUrl, isVideo: isVid }) => (
            <div
              key={id}
              className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-[#154734]/30 bg-gray-100"
            >
              {isVid ? (
                <video src={previewUrl} muted className="absolute inset-0 w-full h-full object-cover opacity-40" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Subiendo…" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#154734] animate-spin" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
