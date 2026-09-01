"use client";

import { useCallback, useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { SaveIcon } from "@/components/icons";
import {
  HeroApiError,
  updateHeroSettings,
} from "@/modules/hero/presentation/api-client";
import type { HeroSettingsUiModel } from "@/modules/hero/presentation/mappers";

type Props = {
  settings: HeroSettingsUiModel;
  onSettingsChange: (settings: HeroSettingsUiModel) => void;
};

type ToastState = { type: "success" | "error"; message: string } | null;

const MIN_SEC = 2;
const MAX_SEC = 30;

export default function HeroTimingPanel({ settings, onSettingsChange }: Props) {
  const [seconds, setSeconds] = useState(
    Math.round(settings.slideDurationMs / 1000),
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  async function handleSave() {
    const clamped = Math.min(MAX_SEC, Math.max(MIN_SEC, Math.round(seconds) || MIN_SEC));
    setSeconds(clamped);
    setSaving(true);
    try {
      const saved = await updateHeroSettings({ slideDurationMs: clamped * 1000 });
      onSettingsChange({
        slideDurationMs: saved.slideDurationMs,
        updatedAt: saved.updatedAt ?? new Date().toISOString(),
      });
      showToast("success", "Duración guardada. Se aplica en la tienda de inmediato.");
    } catch (err) {
      showToast(
        "error",
        err instanceof HeroApiError || err instanceof Error
          ? err.message
          : "No se pudo guardar la duración.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div
          className={`fixed top-4 right-4 z-80 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
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
      ) : null}

      <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-gray-900">Duración de vista</h2>

        <div className="space-y-1.5">
          <label
            htmlFor="slide-duration-sec"
            className="text-xs font-semibold text-gray-500 uppercase"
          >
            Segundos por slide
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              id="slide-duration-sec"
              type="number"
              min={MIN_SEC}
              max={MAX_SEC}
              step={1}
              value={seconds}
              disabled={saving}
              onChange={(e) => setSeconds(Number(e.target.value))}
              className="w-full sm:w-48 h-11 px-3 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#154734] text-white text-sm font-semibold hover:bg-[#103a2a] transition-colors shadow-sm disabled:opacity-40 w-full sm:w-auto"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SaveIcon size={16} className="text-white" />
              )}
              {saving ? "Guardando..." : "Guardar duración"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Entre {MIN_SEC} y {MAX_SEC} segundos. Actual:{" "}
            {settings.slideDurationMs / 1000}s guardados.
          </p>
        </div>
      </div>
    </div>
  );
}
