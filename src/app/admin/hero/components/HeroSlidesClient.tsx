"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Loader2, ImageIcon, Save, Trash2, Plus, PlayCircle,
  ChevronDown, CheckCircle, AlertCircle,
} from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import type { HeroSlideData } from "../types";
import {
  createHeroSlide,
  deleteHeroSlide,
  HeroApiError,
  updateHeroSlide,
} from "@/modules/adminCatalog/hero/presentation/api-client";

// ─── Toast local (mismo patrón que admin/productos) ───────────────────────────

type ToastState = { type: "success" | "error"; message: string } | null;

function ToastNotification({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-60 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
        toast.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0" />
      )}
      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
}

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface SlideForm {
  id: string | null;
  position: number;
  mediaUrl: string;
  mediaType: "image" | "video";
  headline: string;
  subheadline: string;
  saving: boolean;
  deleting: boolean;
  collapsed: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.includes("/video/upload/") ||
    [".mp4", ".webm", ".mov", ".ogg", ".mkv", ".m4v"].some((ext) => clean.endsWith(ext))
  );
}

function fromDb(slide: HeroSlideData): SlideForm {
  return {
    id: slide.id,
    position: slide.position,
    mediaUrl: slide.mediaUrl,
    mediaType: slide.mediaType,
    headline: slide.headline ?? "",
    subheadline: slide.subheadline ?? "",
    saving: false,
    deleting: false,
    collapsed: true, // Los slides ya guardados empiezan colapsados
  };
}

function emptyForm(position: number): SlideForm {
  return {
    id: null,
    position,
    mediaUrl: "",
    mediaType: "image",
    headline: "",
    subheadline: "",
    saving: false,
    deleting: false,
    collapsed: false, // Nuevo slide empieza expandido
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  slides: HeroSlideData[];
}

export default function HeroSlidesClient({ slides }: Props) {
  const [forms, setForms] = useState<SlideForm[]>(slides.map(fromDb));
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  function patch(index: number, update: Partial<SlideForm>) {
    setForms((prev) => prev.map((f, i) => (i === index ? { ...f, ...update } : f)));
  }

  function onMediaChange(index: number, urls: string[]) {
    const url = urls[0] ?? "";
    patch(index, {
      mediaUrl: url,
      mediaType: url ? (isVideoUrl(url) ? "video" : "image") : "image",
    });
  }

  function addSlide() {
    const nextPos = forms.length > 0 ? Math.max(...forms.map((f) => f.position)) + 1 : 1;
    setForms((prev) => [...prev, emptyForm(nextPos)]);
  }

  async function saveSlide(index: number) {
    const form = forms[index];
    if (!form.mediaUrl) {
      showToast("error", "Debes subir una imagen o video antes de guardar.");
      return;
    }

    patch(index, { saving: true });

    try {
      const isNew = form.id === null;
      const saved = isNew
        ? await createHeroSlide({
            mediaUrl: form.mediaUrl,
            mediaType: form.mediaType,
            headline: form.headline,
            subheadline: form.subheadline,
          })
        : await updateHeroSlide({
            id: form.id!,
            mediaUrl: form.mediaUrl,
            mediaType: form.mediaType,
            headline: form.headline,
            subheadline: form.subheadline,
          });
      patch(index, { id: saved.id, saving: false, collapsed: true });
      showToast("success", `Slide ${form.position} guardado correctamente.`);
    } catch (err) {
      patch(index, { saving: false });
      showToast(
        "error",
        err instanceof HeroApiError || err instanceof Error
          ? err.message
          : "Error inesperado al guardar."
      );
    }
  }

  async function deleteSlide(index: number) {
    const form = forms[index];

    if (form.id === null) {
      setForms((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    patch(index, { deleting: true });

    try {
      await deleteHeroSlide(form.id);

      setForms((prev) => prev.filter((_, i) => i !== index));
      showToast("success", "Slide eliminado correctamente.");
    } catch (err) {
      patch(index, { deleting: false });
      showToast("error", err instanceof Error ? err.message : "Error al eliminar.");
    }
  }

  return (
    <>
      <ToastNotification toast={toast} />

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {forms.map((form, index) => (
            <SlideCard
              key={form.id ?? `new-${index}`}
              form={form}
              index={index}
              onToggleCollapse={() => patch(index, { collapsed: !form.collapsed })}
              onMediaChange={(urls) => onMediaChange(index, urls)}
              onHeadlineChange={(v) => patch(index, { headline: v })}
              onSubheadlineChange={(v) => patch(index, { subheadline: v })}
              onSave={() => saveSlide(index)}
              onDelete={() => deleteSlide(index)}
            />
          ))}
        </div>

        {/* Botón agregar slide */}
        <button
          type="button"
          onClick={addSlide}
          className="w-full py-4 border-2 border-dashed border-[#154734]/30 hover:border-[#C19A6B] rounded-3xl flex items-center justify-center gap-3 text-sm font-semibold text-[#154734]/50 hover:text-[#C19A6B] transition-all duration-200 active:scale-[0.99] group"
        >
          <span className="w-8 h-8 rounded-full bg-[#154734]/5 group-hover:bg-[#C19A6B]/10 flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4" />
          </span>
          Agregar otro slide al header
        </button>
      </div>
    </>
  );
}

// ─── SlideCard ────────────────────────────────────────────────────────────────

interface SlideCardProps {
  form: SlideForm;
  index: number;
  onToggleCollapse: () => void;
  onMediaChange: (urls: string[]) => void;
  onHeadlineChange: (v: string) => void;
  onSubheadlineChange: (v: string) => void;
  onSave: () => void;
  onDelete: () => void;
}

function SlideCard({
  form,
  index,
  onToggleCollapse,
  onMediaChange,
  onHeadlineChange,
  onSubheadlineChange,
  onSave,
  onDelete,
}: SlideCardProps) {
  const isVideo = form.mediaType === "video";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Cabecera (siempre visible) ── */}
      <div className="px-6 py-5 border-b border-gray-100 bg-[#FAFAFA] flex items-center gap-3">

        {/* Ícono del tipo de media */}
        <div className="w-9 h-9 bg-[#154734]/10 rounded-xl flex items-center justify-center shrink-0">
          {isVideo ? (
            <PlayCircle className="w-4 h-4 text-[#154734]" />
          ) : (
            <ImageIcon className="w-4 h-4 text-[#154734]" />
          )}
        </div>

        {/* Botón colapsar/expandir — ocupa el espacio del título */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex-1 flex items-center justify-between group text-left"
          aria-expanded={!form.collapsed}
        >
          <div>
            <span
              className="font-semibold text-[#154734] text-base group-hover:text-[#103a2a] transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Slide {index + 1}
            </span>
            <p className="text-[11px] text-gray-400">
              {form.id ? "Guardado en tienda" : "Nuevo — aún no guardado"}
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 group-hover:text-[#154734] transition-all duration-300 shrink-0 mr-2 ${
              form.collapsed ? "" : "rotate-180"
            }`}
          />
        </button>

        {/* Botón eliminar */}
        <button
          type="button"
          onClick={onDelete}
          disabled={form.deleting || form.saving}
          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 shrink-0"
          title="Eliminar slide"
        >
          {form.deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* ── Cuerpo colapsable ── */}
      {!form.collapsed && (
        <div className="p-6 space-y-6">

          {/* Preview actual */}
          {form.mediaUrl && (
            <div className="relative w-full aspect-16/7 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              {isVideo ? (
                <video
                  src={form.mediaUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  loop
                  autoPlay
                  preload="metadata"
                />
              ) : (
                <Image
                  src={form.mediaUrl}
                  alt={`Preview slide ${index + 1}`}
                  fill
                  loading="lazy"
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
              <span className="absolute bottom-3 left-3 text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {isVideo ? "Video actual" : "Imagen actual"}
              </span>
            </div>
          )}

          {/* Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-[#C19A6B]" />
              {form.mediaUrl ? "Reemplazar media" : "Subir imagen o video"}
            </label>
            <p className="text-[11px] text-gray-400">
              Imágenes: 1920×800 px recomendado. Videos: MP4, MOV, WebM.
            </p>
            <ImageUpload
              value={form.mediaUrl ? [form.mediaUrl] : []}
              disabled={form.saving}
              onChange={onMediaChange}
              onRemove={() => onMediaChange([])}
              maxImages={1}
            />
          </div>

          {/* Textos opcionales */}
          <div className="space-y-4 border-t border-gray-100 pt-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 block">
              Texto del slide{" "}
              <span className="font-light normal-case tracking-normal text-gray-400">
                (opcional)
              </span>
            </label>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-500">Título principal</label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => onHeadlineChange(e.target.value)}
                placeholder='Ej: "¡Bienvenida!"'
                className="w-full px-4 py-3 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-[#154734] text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-500">Subtítulo</label>
              <input
                type="text"
                value={form.subheadline}
                onChange={(e) => onSubheadlineChange(e.target.value)}
                placeholder='Ej: "A tu nueva tienda favorita"'
                className="w-full px-4 py-3 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-[#154734] text-sm"
              />
            </div>
          </div>

          {/* Guardar */}
          <button
            type="button"
            onClick={onSave}
            disabled={form.saving || form.deleting || !form.mediaUrl}
            className="w-full py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-[#154734] hover:bg-[#103a2a] rounded-xl shadow-lg hover:shadow-[#154734]/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {form.saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {form.saving ? "Guardando..." : "Guardar cambios"}
          </button>

          {!form.mediaUrl && (
            <p className="text-center text-[11px] text-gray-400">
              Sube una imagen o video para activar el botón
            </p>
          )}
        </div>
      )}
    </div>
  );
}
