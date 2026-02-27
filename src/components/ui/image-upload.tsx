"use client";

import { useState } from "react";
import { Trash2, PlusCircle, PlayCircle } from "lucide-react";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg", ".mkv"];

function isVideo(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
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
  const [inputUrl, setInputUrl] = useState("");

  const handleAdd = () => {
    const url = inputUrl.trim();
    if (!url || !url.startsWith("http") || value.includes(url) || value.length >= maxImages) return;
    onChange([url]);
    setInputUrl("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const remaining = maxImages - value.length;
  const validItems = value.filter((url) => url && typeof url === "string" && url.startsWith("http"));

  return (
    <div className="space-y-3">
      {/* Input de URL */}
      {remaining > 0 && !disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://... (.jpg, .png, .mp4, .webm…)"
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154734]/30 focus:border-[#154734]"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inputUrl.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#154734] text-white text-sm font-medium rounded-lg hover:bg-[#154734]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Añadir archivo
          </button>
        </div>
      )}

      {/* Contador */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{value.length} de {maxImages} archivos</span>
        {value.length > 0 && (
          <span className="text-[#C19A6B] font-medium">
            El primer archivo será la portada
          </span>
        )}
      </div>

      {/* Grid de previsualización */}
      {validItems.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {validItems.map((url, index) => (
            <div
              key={url}
              className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 group hover:border-[#C19A6B] transition-colors bg-gray-100"
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
                  alt={`Imagen ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
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
        </div>
      )}
    </div>
  );
}
