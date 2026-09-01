"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle, Plus } from "lucide-react";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import type { HeroSlideData } from "../types";
import {
  createHeroSlide,
  deleteHeroSlide,
  HeroApiError,
  updateHeroSlide,
  type SavedHeroSlideResponse,
} from "@/modules/hero/presentation/api-client";
import { normalizeMediaFocus } from "@/components/HeroSection/mediaFocus";
import HeroSlidesTable from "./HeroSlidesTable";
import SlideEditModal, { type SlideEditFormValues } from "./SlideEditModal";

type ToastState = { type: "success" | "error" | "warning"; message: string } | null;

function ToastNotification({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  const styles =
    toast.type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : toast.type === "warning"
        ? "bg-amber-50 border-amber-200 text-amber-900"
        : "bg-red-50 border-red-200 text-red-800";
  return (
    <div
      className={`fixed top-4 right-4 z-80 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${styles}`}
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

function mapSavedToSlide(
  saved: SavedHeroSlideResponse,
  values: SlideEditFormValues,
  fallbackPosition: number,
  previous?: HeroSlideData,
): HeroSlideData {
  return {
    id: saved.id,
    position: saved.position ?? previous?.position ?? fallbackPosition,
    mediaUrl: saved.mediaUrl ?? values.mediaUrl,
    mediaUrlMobile:
      saved.mediaUrlMobile !== undefined
        ? saved.mediaUrlMobile
        : values.mediaUrlMobile,
    mediaUrlTablet:
      saved.mediaUrlTablet !== undefined
        ? saved.mediaUrlTablet
        : values.mediaUrlTablet,
    posterUrl: saved.posterUrl ?? previous?.posterUrl ?? null,
    mediaType: (saved.mediaType as "image" | "video") ?? values.mediaType,
    headline: saved.headline !== undefined ? saved.headline : values.headline || null,
    subheadline:
      saved.subheadline !== undefined ? saved.subheadline : values.subheadline || null,
    mediaFocus: normalizeMediaFocus(saved.mediaFocus ?? values.mediaFocus),
    playFullVideo:
      saved.playFullVideo ??
      (values.mediaType === "video" ? values.playFullVideo : false),
    isActive: saved.isActive ?? previous?.isActive ?? true,
    updatedAt: new Date().toISOString(),
  };
}

interface Props {
  slides: HeroSlideData[];
  onSlidesChange?: (slides: HeroSlideData[]) => void;
  /** Increment to open the create modal (e.g. from parent “Agregar slide”). */
  createNonce?: number;
  hideAddButton?: boolean;
}

export default function HeroSlidesClient({
  slides: initialSlides,
  onSlidesChange,
  createNonce = 0,
  hideAddButton = false,
}: Props) {
  const [slides, setSlidesState] = useState<HeroSlideData[]>(initialSlides);
  const [toast, setToast] = useState<ToastState>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlideData | null>(null);
  const [editor, setEditor] = useState<
    | { mode: "create" }
    | { mode: "edit"; slide: HeroSlideData }
    | null
  >(null);
  const skipParentSync = useRef(true);

  const setSlides = useCallback(
    (updater: HeroSlideData[] | ((prev: HeroSlideData[]) => HeroSlideData[])) => {
      setSlidesState(updater);
    },
    [],
  );

  // Sync parent after commit — never call parent setState inside a child setState updater.
  useEffect(() => {
    if (skipParentSync.current) {
      skipParentSync.current = false;
      return;
    }
    onSlidesChange?.(slides);
  }, [slides, onSlidesChange]);

  useEffect(() => {
    if (createNonce > 0) {
      setEditor({ mode: "create" });
    }
  }, [createNonce]);

  const showToast = useCallback(
    (type: "success" | "error" | "warning", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  async function handleSave(values: SlideEditFormValues) {
    if (!editor) return;
    setSaving(true);
    try {
      if (editor.mode === "create") {
        const saved = await createHeroSlide({
          mediaUrl: values.mediaUrl,
          mediaUrlMobile: values.mediaUrlMobile,
          mediaUrlTablet: values.mediaUrlTablet,
          mediaType: values.mediaType,
          headline: values.headline,
          subheadline: values.subheadline,
          mediaFocus: values.mediaFocus,
          playFullVideo: values.mediaType === "video" ? values.playFullVideo : false,
        });
        const nextPos =
          slides.length > 0 ? Math.max(...slides.map((s) => s.position)) + 1 : 1;
        const row = mapSavedToSlide(saved, values, nextPos);
        setSlides((prev) =>
          [...prev, row].sort((a, b) => a.position - b.position),
        );
        showToast("success", "Slide creado correctamente.");
      } else {
        const saved = await updateHeroSlide({
          id: editor.slide.id,
          mediaUrl: values.mediaUrl,
          mediaUrlMobile: values.mediaUrlMobile,
          mediaUrlTablet: values.mediaUrlTablet,
          mediaType: values.mediaType,
          headline: values.headline,
          subheadline: values.subheadline,
          mediaFocus: values.mediaFocus,
          playFullVideo: values.mediaType === "video" ? values.playFullVideo : false,
        });
        const row = mapSavedToSlide(saved, values, editor.slide.position, editor.slide);
        setSlides((prev) =>
          prev.map((s) => (s.id === editor.slide.id ? row : s)),
        );
        showToast("success", `Slide ${editor.slide.position} guardado correctamente.`);
      }
      setEditor(null);
    } catch (err) {
      showToast(
        "error",
        err instanceof HeroApiError || err instanceof Error
          ? err.message
          : "Error inesperado al guardar.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(slide: HeroSlideData) {
    setActionId(slide.id);
    const nextActive = !slide.isActive;
    try {
      await updateHeroSlide({ id: slide.id, isActive: nextActive });
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, isActive: nextActive } : s)),
      );
      showToast(
        "success",
        nextActive ? "Slide activado en la tienda." : "Slide desactivado.",
      );
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "No se pudo cambiar el estado.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setConfirmLoading(true);
    setActionId(deleteTarget.id);
    try {
      const result = await deleteHeroSlide(deleteTarget.id);
      setSlides((prev) => {
        const remaining = prev.filter((s) => s.id !== deleteTarget.id);
        return remaining.map((s, i) => ({ ...s, position: i + 1 }));
      });
      if (result.mediaCleanupFailed) {
        showToast(
          "warning",
          "Slide eliminado de la tienda. No se pudo borrar el archivo en Bunny; revisa almacenamiento.",
        );
      } else {
        showToast("success", "Slide eliminado de la tienda y de Bunny.");
      }
      setDeleteTarget(null);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Error al eliminar.",
      );
    } finally {
      setConfirmLoading(false);
      setActionId(null);
    }
  }

  return (
    <>
      <ToastNotification toast={toast} />

      <div className="space-y-4">
        {!hideAddButton ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setEditor({ mode: "create" })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#154734] text-white text-sm font-semibold hover:bg-[#103a2a] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar slide
            </button>
          </div>
        ) : null}

        <HeroSlidesTable
          slides={slides}
          actionId={actionId}
          onEdit={(slide) => setEditor({ mode: "edit", slide })}
          onDelete={(slide) => setDeleteTarget(slide)}
          onToggleActive={handleToggleActive}
        />
      </div>

      {editor ? (
        <SlideEditModal
          key={editor.mode === "edit" ? `edit-${editor.slide.id}` : "create"}
          open
          mode={editor.mode}
          initial={editor.mode === "edit" ? editor.slide : null}
          saving={saving}
          onClose={() => {
            if (!saving) setEditor(null);
          }}
          onSave={handleSave}
        />
      ) : null}

      <AdminConfirmModal
        open={!!deleteTarget}
        title="Eliminar slide"
        description="¿Seguro que deseas eliminar este slide? Se borrará de la tienda y el archivo se eliminará de Bunny."
        confirmLabel="Eliminar"
        variant="danger"
        loading={confirmLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!confirmLoading) setDeleteTarget(null);
        }}
      />
    </>
  );
}
