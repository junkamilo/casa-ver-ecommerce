"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import type { HeroImageVariant } from "@/lib/upload-limits";
import { formatBytesLabel } from "@/lib/upload-limits";
import type { HeroProcessResult } from "@/lib/hero-image-process";
import { uploadHeroImageVariant, uploadHeroVideo } from "@/lib/hero-upload";
import { createPhaseEvent, type UploadProgressEvent } from "@/lib/upload-progress";

type HeroSlotUploadProps = {
  label: string;
  hint: string;
  disabled?: boolean;
  variant?: HeroImageVariant;
  mode: "image" | "video";
  onUploaded: (url: string, report?: HeroProcessResult) => void;
  onError?: (message: string) => void;
  onProgressChange?: (event: UploadProgressEvent | null) => void;
};

export default function HeroSlotUpload({
  label,
  hint,
  disabled,
  variant = "desktop",
  mode,
  onUploaded,
  onError,
  onProgressChange,
}: HeroSlotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [lastReport, setLastReport] = useState<HeroProcessResult | null>(null);

  function emitProgress(event: UploadProgressEvent | null) {
    onProgressChange?.(event);
  }

  async function handleFile(file: File) {
    setBusy(true);
    setLastReport(null);
    emitProgress(createPhaseEvent("validating", { progress: 2 }));

    const uploadOptions = {
      onProgress: (event: UploadProgressEvent) => emitProgress(event),
    };

    try {
      if (mode === "video") {
        const url = await uploadHeroVideo(file, uploadOptions);
        onUploaded(url);
        return;
      }
      const { url, report } = await uploadHeroImageVariant(file, variant, uploadOptions);
      setLastReport(report);
      onUploaded(url, report);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setBusy(false);
      emitProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#C19A6B] hover:bg-[#FAFAFA] text-sm font-medium text-gray-600 disabled:opacity-40 transition-colors"
      >
        <Upload className="w-4 h-4 text-[#C19A6B]" />
        {busy ? "Procesando y subiendo…" : label}
      </button>
      {hint ? <p className="text-[11px] text-gray-400">{hint}</p> : null}
      {lastReport ? (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-900 space-y-0.5">
          <p className="font-medium truncate">
            Entrada · {formatBytesLabel(lastReport.inputBytes)} · {lastReport.inputWidth}×
            {lastReport.inputHeight}
          </p>
          <p>
            ↓ {variant} · {lastReport.outputWidth}×{lastReport.outputHeight} ·{" "}
            {formatBytesLabel(lastReport.outputBytes)} ✓
          </p>
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={mode === "video" ? "video/mp4,.mp4" : "image/jpeg,image/png,image/webp,image/gif"}
        className="sr-only"
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
