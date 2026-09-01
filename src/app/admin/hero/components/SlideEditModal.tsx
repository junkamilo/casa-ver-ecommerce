"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AlertTriangle, ImageIcon, Loader2, X } from "lucide-react";
import { DeleteIcon, SaveIcon } from "@/components/icons";
import { useIsClient } from "@/hooks/use-is-client";
import {
  DEFAULT_MEDIA_FOCUS,
  normalizeMediaFocus,
  type MediaFocus,
} from "@/components/HeroSection/mediaFocus";
import type { HeroSlideData } from "../types";
import HeroFocusEditor from "./HeroFocusEditor";
import HeroSlotUpload from "./HeroSlotUpload";
import { HERO_IMAGE, HERO_VIDEO, formatBytesLabel } from "@/lib/upload-limits";
import type { UploadProgressEvent } from "@/lib/upload-progress";
import UploadProgressOverlay from "@/components/ui/upload-progress-overlay";

export type SlideEditFormValues = {
  mediaUrl: string;
  mediaUrlMobile: string | null;
  mediaUrlTablet: string | null;
  mediaType: "image" | "video";
  headline: string;
  subheadline: string;
  mediaFocus: MediaFocus;
  playFullVideo: boolean;
};

type SlideEditModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: HeroSlideData | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: SlideEditFormValues) => void;
};

const SLOT_SPECS: Record<
  "desktop" | "mobile" | "tablet",
  {
    label: string;
    dimensions: string;
    ratio: string;
    targetBytes: number;
    recommended?: boolean;
  }
> = {
  desktop: {
    label: "Desktop (obligatorio)",
    dimensions: "2560×1100",
    ratio: "21:9",
    targetBytes: HERO_IMAGE.variants.desktop.targetBytes,
  },
  mobile: {
    label: "Mobile",
    dimensions: "1080×1350",
    ratio: "4:5",
    targetBytes: HERO_IMAGE.variants.mobile.targetBytes,
    recommended: true,
  },
  tablet: {
    label: "Tablet (opcional)",
    dimensions: "1536×1024",
    ratio: "3:2",
    targetBytes: HERO_IMAGE.variants.tablet.targetBytes,
  },
};

function formatTargetLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `≤${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `≤${Math.round(bytes / 1024)} KB`;
}

function HeroImageSpecBadge({
  dimensions,
  ratio,
  targetBytes,
}: {
  dimensions: string;
  ratio: string;
  targetBytes: number;
}) {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium leading-snug text-gray-600">
      {dimensions} · {ratio} · {formatBytesLabel(HERO_IMAGE.maxInputBytes)} máx. → WebP{" "}
      {formatTargetLabel(targetBytes)}
    </span>
  );
}

function HeroVideoSpecBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-medium leading-snug text-violet-800">
      MP4 H.264 · {formatBytesLabel(HERO_VIDEO.maxInputBytes)} máx. · ≤{HERO_VIDEO.maxDurationSec} s
    </span>
  );
}

function SectionTitleWithSpecs({
  icon: Icon,
  title,
  children,
}: {
  icon?: typeof ImageIcon;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 shrink-0">
        {Icon ? <Icon className="w-3.5 h-3.5 text-[#C19A6B]" /> : null}
        {title}
      </span>
      {children ? (
        <>
          <span aria-hidden className="hidden sm:block h-3.5 w-px bg-gray-200 shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5">{children}</div>
        </>
      ) : null}
    </div>
  );
}

function emptyValues(): SlideEditFormValues {
  return {
    mediaUrl: "",
    mediaUrlMobile: null,
    mediaUrlTablet: null,
    mediaType: "image",
    headline: "",
    subheadline: "",
    mediaFocus: {
      mobile: { ...DEFAULT_MEDIA_FOCUS.mobile },
      tablet: { ...DEFAULT_MEDIA_FOCUS.tablet },
      desktop: { ...DEFAULT_MEDIA_FOCUS.desktop },
    },
    playFullVideo: false,
  };
}

function fromSlide(slide: HeroSlideData): SlideEditFormValues {
  return {
    mediaUrl: slide.mediaUrl,
    mediaUrlMobile: slide.mediaUrlMobile ?? null,
    mediaUrlTablet: slide.mediaUrlTablet ?? null,
    mediaType: slide.mediaType,
    headline: slide.headline ?? "",
    subheadline: slide.subheadline ?? "",
    mediaFocus: normalizeMediaFocus(slide.mediaFocus),
    playFullVideo: Boolean(slide.playFullVideo),
  };
}

function SlotPreview({
  url,
  label,
  onClear,
  disabled,
}: {
  url: string;
  label: string;
  onClear: () => void;
  disabled: boolean;
}) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
      <Image
        src={url}
        alt={label}
        fill
        loading="lazy"
        className="object-cover"
        sizes="320px"
      />
      <span className="absolute bottom-0 left-0 right-0 bg-[#154734]/85 text-white text-[10px] font-bold text-center py-1 tracking-wide">
        {label}
      </span>
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="absolute top-2 right-2 z-10 disabled:opacity-40"
        aria-label={`Eliminar ${label}`}
        title={`Eliminar ${label}`}
      >
        <DeleteIcon size={16} className="bg-white/95 shadow-md" />
      </button>
    </div>
  );
}

export default function SlideEditModal({
  open,
  mode,
  initial,
  saving,
  onClose,
  onSave,
}: SlideEditModalProps) {
  const mounted = useIsClient();
  const [values, setValues] = useState<SlideEditFormValues>(() =>
    initial ? fromSlide(initial) : emptyValues(),
  );
  const [slotError, setSlotError] = useState<string | null>(null);
  const [slotUploadProgress, setSlotUploadProgress] =
    useState<UploadProgressEvent | null>(null);

  const uploadBlocked = saving || slotUploadProgress !== null;

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && !uploadBlocked) onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, uploadBlocked, onClose]);

  if (!mounted || !open) return null;

  const isVideo = values.mediaType === "video";

  function onDesktopImage(url: string) {
    setSlotError(null);
    setValues((prev) => ({
      ...prev,
      mediaUrl: url,
      mediaType: "image",
      playFullVideo: false,
    }));
  }

  function onDesktopVideo(url: string) {
    setSlotError(null);
    setValues((prev) => ({
      ...prev,
      mediaUrl: url,
      mediaType: "video",
      mediaUrlMobile: null,
      mediaUrlTablet: null,
    }));
  }

  function onArtSlotUrl(field: "mediaUrlMobile" | "mediaUrlTablet", url: string) {
    setSlotError(null);
    setValues((prev) => ({ ...prev, [field]: url || null }));
  }

  function clearDesktop() {
    setValues((prev) => ({
      ...emptyValues(),
      headline: prev.headline,
      subheadline: prev.subheadline,
      mediaFocus: prev.mediaFocus,
    }));
  }

  function handleSubmit() {
    if (!values.mediaUrl || saving) return;
    onSave({
      ...values,
      mediaUrlMobile: isVideo ? null : values.mediaUrlMobile,
      mediaUrlTablet: isVideo ? null : values.mediaUrlTablet,
    });
  }

  return createPortal(
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        disabled={uploadBlocked}
        onClick={() => {
          if (!uploadBlocked) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-edit-title"
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-100"
      >
        {slotUploadProgress ? (
          <UploadProgressOverlay
            open
            variant="fullscreen"
            message={slotUploadProgress.message}
            submessage={slotUploadProgress.detail}
            progress={slotUploadProgress.progress}
            progressLabel={slotUploadProgress.detail}
            className="absolute inset-0 z-20 rounded-3xl"
          />
        ) : null}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-3xl">
          <h2
            id="slide-edit-title"
            className="text-lg font-semibold text-[#154734]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {mode === "create" ? "Nuevo slide" : "Editar slide"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={uploadBlocked}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-40"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Desktop imagen o video */}
          <div className="space-y-3">
            <SectionTitleWithSpecs icon={ImageIcon} title="Media principal">
              <HeroImageSpecBadge
                dimensions={SLOT_SPECS.desktop.dimensions}
                ratio={SLOT_SPECS.desktop.ratio}
                targetBytes={SLOT_SPECS.desktop.targetBytes}
              />
              <HeroVideoSpecBadge />
            </SectionTitleWithSpecs>

            {values.mediaUrl && !isVideo ? (
              <SlotPreview
                url={values.mediaUrl}
                label="DESKTOP"
                onClear={clearDesktop}
                disabled={saving}
              />
            ) : null}
            {values.mediaUrl && isVideo ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-700 font-medium">Video MP4 listo</p>
                <button
                  type="button"
                  onClick={clearDesktop}
                  disabled={saving}
                  className="disabled:opacity-40"
                  aria-label="Eliminar video"
                >
                  <DeleteIcon size={16} className="bg-white shadow-sm" />
                </button>
              </div>
            ) : null}

            {!values.mediaUrl ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <HeroSlotUpload
                  label="Subir imagen desktop"
                  hint=""
                  variant="desktop"
                  mode="image"
                  disabled={uploadBlocked}
                  onUploaded={onDesktopImage}
                  onError={setSlotError}
                  onProgressChange={setSlotUploadProgress}
                />
                <HeroSlotUpload
                  label="Subir video MP4"
                  hint=""
                  mode="video"
                  disabled={uploadBlocked}
                  onUploaded={onDesktopVideo}
                  onError={setSlotError}
                  onProgressChange={setSlotUploadProgress}
                />
              </div>
            ) : !isVideo ? (
              <HeroSlotUpload
                label="Reemplazar imagen desktop"
                  hint=""
                  variant="desktop"
                  mode="image"
                  disabled={uploadBlocked}
                  onUploaded={onDesktopImage}
                  onError={setSlotError}
                  onProgressChange={setSlotUploadProgress}
                />
            ) : null}
          </div>

          {/* Mobile + Tablet — images only */}
          {!isVideo && values.mediaUrl ? (
            <>
              <div className="space-y-2">
                <SectionTitleWithSpecs title={SLOT_SPECS.mobile.label}>
                  <HeroImageSpecBadge
                    dimensions={SLOT_SPECS.mobile.dimensions}
                    ratio={SLOT_SPECS.mobile.ratio}
                    targetBytes={SLOT_SPECS.mobile.targetBytes}
                  />
                  {SLOT_SPECS.mobile.recommended ? (
                    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Recomendado
                    </span>
                  ) : null}
                </SectionTitleWithSpecs>
                {!values.mediaUrlMobile ? (
                  <p className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Sin arte mobile se usará el desktop con encuadre (puede verse corto).
                  </p>
                ) : (
                  <SlotPreview
                    url={values.mediaUrlMobile}
                    label="MOBILE"
                    onClear={() => onArtSlotUrl("mediaUrlMobile", "")}
                    disabled={saving}
                  />
                )}
                <HeroSlotUpload
                  label={values.mediaUrlMobile ? "Reemplazar mobile" : "Subir mobile"}
                  hint=""
                  variant="mobile"
                  mode="image"
                  disabled={uploadBlocked}
                  onUploaded={(url) => onArtSlotUrl("mediaUrlMobile", url)}
                  onError={setSlotError}
                  onProgressChange={setSlotUploadProgress}
                />
              </div>

              <div className="space-y-2">
                <SectionTitleWithSpecs title={SLOT_SPECS.tablet.label}>
                  <HeroImageSpecBadge
                    dimensions={SLOT_SPECS.tablet.dimensions}
                    ratio={SLOT_SPECS.tablet.ratio}
                    targetBytes={SLOT_SPECS.tablet.targetBytes}
                  />
                </SectionTitleWithSpecs>
                {values.mediaUrlTablet ? (
                  <SlotPreview
                    url={values.mediaUrlTablet}
                    label="TABLET"
                    onClear={() => onArtSlotUrl("mediaUrlTablet", "")}
                    disabled={saving}
                  />
                ) : null}
                <HeroSlotUpload
                  label={values.mediaUrlTablet ? "Reemplazar tablet" : "Subir tablet"}
                  hint=""
                  variant="tablet"
                  mode="image"
                  disabled={uploadBlocked}
                  onUploaded={(url) => onArtSlotUrl("mediaUrlTablet", url)}
                  onError={setSlotError}
                  onProgressChange={setSlotUploadProgress}
                />
              </div>
            </>
          ) : null}

          {slotError ? (
            <p className="text-[11px] text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {slotError}
            </p>
          ) : null}

          {values.mediaUrl ? (
            <HeroFocusEditor
              mediaUrl={values.mediaUrl}
              mediaUrlMobile={values.mediaUrlMobile}
              mediaUrlTablet={values.mediaUrlTablet}
              mediaType={values.mediaType}
              value={values.mediaFocus}
              disabled={saving}
              onChange={(mediaFocus) =>
                setValues((prev) => ({ ...prev, mediaFocus }))
              }
            />
          ) : null}

          {isVideo && values.mediaUrl ? (
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.playFullVideo}
                disabled={saving}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    playFullVideo: e.target.checked,
                  }))
                }
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#154734] focus:ring-[#154734]"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Reproducir video completo
                </span>
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  Si está activo, el carrusel espera a que termine el video antes
                  de pasar al siguiente slide. Si no, usa la duración de
                  Temporización.
                </span>
              </span>
            </label>
          ) : null}

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
                value={values.headline}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, headline: e.target.value }))
                }
                placeholder='Ej: "¡Bienvenida!"'
                disabled={saving}
                className="w-full px-4 py-3 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-[#154734] text-sm disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-500">Subtítulo</label>
              <input
                type="text"
                value={values.subheadline}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, subheadline: e.target.value }))
                }
                placeholder='Ej: "A tu nueva tienda favorita"'
                disabled={saving}
                className="w-full px-4 py-3 bg-[#FAFAFA] rounded-xl border border-gray-200 focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-[#154734] text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !values.mediaUrl}
            className="w-full py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-[#154734] hover:bg-[#103a2a] rounded-xl shadow-lg hover:shadow-[#154734]/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SaveIcon size={16} className="text-white" />
            )}
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          {!values.mediaUrl ? (
            <p className="text-center text-[11px] text-gray-400">
              Sube el arte desktop para activar el botón
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
