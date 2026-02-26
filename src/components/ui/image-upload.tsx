"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Trash2, Images } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    cloudinary: any;
  }
}

interface ImageUploadProps {
  value: string[];
  disabled?: boolean;
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
  maxImages?: number;
}

export default function ImageUpload({
  value,
  disabled,
  onChange,
  onRemove,
  maxImages = 5,
}: ImageUploadProps) {
  const widgetRef = useRef<any>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Cargar script del widget
  useEffect(() => {
    if (document.querySelector('script[src*="media-library.cloudinary.com"]')) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://media-library.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
  }, []);

  // Crear / recrear widget cuando cambia value (para actualizar max_files)
  useEffect(() => {
    if (!scriptReady || !window.cloudinary) return;

    widgetRef.current = window.cloudinary.createMediaLibrary(
      {
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        multiple: true,
        max_files: maxImages - value.length,
      },
      {
        insertHandler: (data: { assets: { secure_url: string }[] }) => {
          data.assets.forEach((asset) => {
            if (value.length < maxImages && !value.includes(asset.secure_url)) {
              onChange(asset.secure_url);
            }
          });
        },
      }
    );
  }, [scriptReady, value, maxImages, onChange]);

  const openWidget = () => {
    if (widgetRef.current) widgetRef.current.show();
  };

  const remaining = maxImages - value.length;

  return (
    <div className="space-y-3">
      {/* Botón abrir Media Library */}
      {remaining > 0 && !disabled && (
        <button
          type="button"
          onClick={openWidget}
          disabled={!scriptReady}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#154734] text-white rounded-lg hover:bg-[#154734]/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Images className="w-4 h-4" />
          {scriptReady ? "Seleccionar desde Cloudinary" : "Cargando widget..."}
        </button>
      )}

      {/* Contador */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{value.length} de {maxImages} imágenes</span>
        {value.length > 0 && (
          <span className="text-[#C19A6B] font-medium">
            La primera imagen será la portada
          </span>
        )}
      </div>

      {/* Grid de imágenes */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
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
