"use client";

import { useRef, useState } from "react";
import { Trash2, Upload, Loader2, PlayCircle, AlertCircle } from "lucide-react";
import { uploadToCloudinary, validateFileSize } from "@/lib/cloudinary";

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
  onSetCover?: (url: string) => void;
  maxImages?: number;
  /** Cuando se pasa, activa el layout de card por color */
  colorInfo?: { name: string; hexCode: string };
}

export default function ImageUpload({
  value,
  disabled,
  onChange,
  onRemove,
  onSetCover,
  maxImages = 5,
  colorInfo,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ id: string; previewUrl: string; isVideo: boolean }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const remaining = maxImages - value.length - uploading.length;
  const total = value.length + uploading.length;

  const handleFiles = async (files: FileList) => {
    setUploadError(null);

    const candidates = Array.from(files).slice(0, Math.max(0, remaining));
    if (!candidates.length) return;

    // Validar tamaño antes de subir
    for (const file of candidates) {
      const sizeError = validateFileSize(file);
      if (sizeError) {
        setUploadError(sizeError);
        return;
      }
    }

    const pending = candidates.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video"),
      file,
    }));

    setUploading((prev) => [
      ...prev,
      ...pending.map(({ id, previewUrl, isVideo: isVid }) => ({ id, previewUrl, isVideo: isVid })),
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

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length) {
      const firstError = (failures[0] as PromiseRejectedResult).reason;
      setUploadError(
        firstError instanceof Error
          ? firstError.message
          : "Error al subir uno o más archivos"
      );
      // Limpiar previews fallidos
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          URL.revokeObjectURL(pending[i].previewUrl);
          setUploading((prev) => prev.filter((u) => u.id !== pending[i].id));
        }
      });
    }
  };

  /* ── Layout COLOR ─────────────────────────────────────── */
  if (colorInfo) {
    return (
      <div className="space-y-3">
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

        {/* Fila superior: info color | botón subir */}
        <div className="grid grid-cols-2 gap-3">
          {/* Info color */}
          <div className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-gray-200 bg-white min-h-18">
            <span
              className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0"
              style={{ backgroundColor: colorInfo.hexCode }}
            />
            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
              {colorInfo.name}
            </span>
            <span className="text-[11px] text-gray-400">
              {total} archivo{total !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Botón subir */}
          <button
            type="button"
            disabled={disabled || remaining <= 0}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-gray-300 bg-white hover:border-[#154734] hover:bg-[#154734]/5 transition-colors text-gray-400 hover:text-[#154734] min-h-18 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-400"
          >
            <Upload className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium text-center leading-tight">
              Subir foto o video
            </span>
            <span className="text-[9px] text-center text-gray-400 leading-tight">
              JPEG, PNG, HEIC, MP4, MOV…
            </span>
          </button>
        </div>

        {/* Error de upload */}
        {uploadError && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 leading-snug">{uploadError}</p>
          </div>
        )}

        {/* Portada hint */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            {total} de {maxImages} archivos
          </span>
          {value.length > 0 && (
            <span className="text-[#C19A6B] font-medium">
              {value.length > 1 ? "Haz clic en una foto o video para elegirlo como portada" : "Este archivo es la portada"}
            </span>
          )}
        </div>

        {/* Galería con scroll horizontal — formato portrait */}
        {(value.length > 0 || uploading.length > 0) && (
          <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
            <div className="flex gap-2.5 pb-1">
              {value.map((url, index) => (
                <div
                  key={url}
                  role={index !== 0 && onSetCover ? "button" : undefined}
                  tabIndex={index !== 0 && onSetCover && !disabled ? 0 : undefined}
                  onClick={() => { if (index !== 0 && onSetCover && !disabled) onSetCover(url); }}
                  onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && index !== 0 && onSetCover && !disabled) onSetCover(url); }}
                  className={`relative shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden border-2 transition-colors bg-gray-100 snap-start group
                    ${index === 0
                      ? "border-[#154734]"
                      : onSetCover && !disabled
                        ? "border-gray-200 hover:border-[#C19A6B] cursor-pointer"
                        : "border-gray-200"
                    }`}
                  style={{ aspectRatio: "2/3" }}
                >
                  {isVideo(url) ? (
                    <>
                      <video
                        src={url}
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                        <PlayCircle className="w-7 h-7 text-white drop-shadow" />
                      </div>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {index === 0 ? (
                    <span className="absolute bottom-0 left-0 right-0 bg-[#154734]/85 text-white text-[9px] font-bold text-center py-1 tracking-wide">
                      PORTADA
                    </span>
                  ) : onSetCover && !disabled && (
                    <span className="absolute bottom-0 left-0 right-0 bg-[#C19A6B]/90 text-white text-[9px] font-bold text-center py-1 tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                      ★ PONER PORTADA
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(url); }}
                    disabled={disabled}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {uploading.map(({ id, previewUrl, isVideo: isVid }) => (
                <div
                  key={id}
                  className="relative shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden border-2 border-[#154734]/30 bg-gray-100 snap-start"
                  style={{ aspectRatio: "2/3" }}
                >
                  {isVid ? (
                    <video
                      src={previewUrl}
                      muted
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Subiendo…"
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#154734] animate-spin" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Layout DEFAULT ───────────────────────────────────── */
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
              Puedes seleccionar varios a la vez · imágenes máx 10 MB · videos máx 100 MB
            </span>
          </button>
        </>
      )}

      {/* Error de upload */}
      {uploadError && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 leading-snug">{uploadError}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{value.length + uploading.length} de {maxImages} archivos</span>
        {value.length > 0 && (
          <span className="text-[#C19A6B] font-medium">
            {value.length > 1 ? "Haz clic en una foto o video para elegirlo como portada" : "Este archivo es la portada"}
          </span>
        )}
      </div>

      {(value.length > 0 || uploading.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <div
              key={url}
              role={index !== 0 && onSetCover ? "button" : undefined}
              tabIndex={index !== 0 && onSetCover && !disabled ? 0 : undefined}
              onClick={() => { if (index !== 0 && onSetCover && !disabled) onSetCover(url); }}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && index !== 0 && onSetCover && !disabled) onSetCover(url); }}
              className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors bg-gray-100 group
                ${index === 0
                  ? "border-[#154734]"
                  : onSetCover && !disabled
                    ? "border-gray-200 hover:border-[#C19A6B] cursor-pointer"
                    : "border-gray-200"
                }`}
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

              {index === 0 ? (
                <span className="absolute bottom-0 left-0 right-0 bg-[#154734]/80 text-white text-[9px] font-bold text-center py-0.5">
                  PORTADA
                </span>
              ) : onSetCover && !disabled && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#C19A6B]/90 text-white text-[9px] font-bold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  ★ PORTADA
                </span>
              )}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(url); }}
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
