"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, AlertCircle } from "lucide-react";
import { uploadToBunny } from "@/lib/bunny";

interface Props {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  /** Notifica al padre cuando comienza o termina una subida */
  onUploadingChange?: (isUploading: boolean) => void;
  /** Carpeta en Bunny Storage (default: products) */
  folder?: "products" | "categories" | "heroes" | "sets";
}

export default function VideoUpload({
  value,
  onChange,
  disabled,
  onUploadingChange,
  folder = "products",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    const local = URL.createObjectURL(file);
    setPreviewUrl(local);
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadToBunny(file, "video", folder);
      onChange(url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Error al subir el video"
      );
    } finally {
      URL.revokeObjectURL(local);
      setPreviewUrl(null);
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const displayUrl = previewUrl ?? value;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,.mov,.mp4"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {!value && !uploading ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#154734] hover:bg-[#154734]/5 transition-colors text-gray-500 hover:text-[#154734] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs font-medium">
            Subir video{" "}
            <span className="font-normal text-gray-400">(MP4, MOV, HEVC…)</span>
          </span>
        </button>
      ) : (
        <div className="relative">
          {uploading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-semibold">Subiendo video…</span>
              </div>
            </div>
          )}
          {displayUrl && (
            <video
              src={displayUrl}
              controls
              className="w-full rounded-lg border border-gray-200 max-h-48 object-contain bg-black"
            />
          )}
          {!uploading && value && (
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#154734] border border-[#154734]/30 rounded-lg hover:bg-[#154734]/5 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" /> Cambiar video
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 leading-snug">{uploadError}</p>
        </div>
      )}
    </div>
  );
}
