"use client";

import { useCallback, useState } from "react";
import { CasaVerdeDatePicker, CasaVerdeTimePicker, getBogotaTodayIso } from "@/components/ui/date-time";
import { PLACEMENT_LABELS } from "@/modules/adminCatalog/promoPopups/domain/promo-popup.entity";
import { isDateBeforeTodayInBogota } from "@/modules/checkout/domain/coupon-schedule";
import type { AdvertisingFormState } from "../constants/advertising-defaults";
import type { AdvertisingScheduleMode } from "../hooks/useAdvertisingManager";
import PromoPopupPreview from "./PromoPopupPreview";
import { Loader2, Megaphone } from "lucide-react";

interface AdvertisingFormPanelProps {
  initialForm: AdvertisingFormState;
  editingId: string | null;
  saving: boolean;
  onSave: (form: AdvertisingFormState) => void;
  onReset: () => void;
  onCopyCode: (code: string) => void;
}

export default function AdvertisingFormPanel({
  initialForm,
  editingId,
  saving,
  onSave,
  onReset,
  onCopyCode,
}: AdvertisingFormPanelProps) {
  const [form, setForm] = useState(initialForm);
  const todayIso = getBogotaTodayIso();

  const updateField = useCallback(
    <K extends keyof AdvertisingFormState>(key: K, value: AdvertisingFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleCouponCodeChange = useCallback((value: string) => {
    updateField("couponCode", value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30));
  }, [updateField]);

  const scheduleDateInvalid =
    form.scheduleEnabled &&
    form.scheduleMode === "SINGLE_DAY" &&
    form.singleDayDate !== "" &&
    isDateBeforeTodayInBogota(form.singleDayDate);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#154734]" />
            {editingId ? "Editar publicidad" : "Nueva publicidad"}
          </h2>
          {editingId ? (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-gray-500 hover:text-[#154734]"
            >
              Cancelar edición
            </button>
          ) : null}
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Solo puede haber <strong>1 publicidad activa</strong> por ubicación (Home, Producto o
          Checkout). Al activar una, las demás de esa ubicación se desactivan automáticamente.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">Nombre interno</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ej. Primera compra Home"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
            <p className="text-[11px] text-gray-400">
              Solo para identificar en el admin. No aparece en el popup de la tienda.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">Ubicación</label>
            <select
              value={form.placement}
              onChange={(e) =>
                updateField("placement", e.target.value as AdvertisingFormState["placement"])
              }
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            >
              {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Título principal <span className="text-[#154734]/70 normal-case">· vista previa</span>
            </label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Subtítulo <span className="text-[#154734]/70 normal-case">· vista previa</span>
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Código a mostrar <span className="text-[#154734]/70 normal-case">· vista previa</span>
            </label>
            <input
              type="text"
              value={form.couponCode}
              onChange={(e) => handleCouponCodeChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Retraso antes de mostrar (seg)
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={form.delaySeconds}
              onChange={(e) =>
                updateField(
                  "delaySeconds",
                  Math.min(60, Math.max(0, Number(e.target.value) || 0))
                )
              }
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Texto legal <span className="text-[#154734]/70 normal-case">· vista previa</span>
          </label>
          <input
            type="text"
            value={form.disclaimer}
            onChange={(e) => updateField("disclaimer", e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Texto del botón <span className="text-[#154734]/70 normal-case">· vista previa</span>
            </label>
            <input
              type="text"
              value={form.ctaText}
              onChange={(e) => updateField("ctaText", e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">URL del botón</label>
            <input
              type="text"
              value={form.ctaUrl}
              onChange={(e) => updateField("ctaUrl", e.target.value)}
              placeholder="/tienda"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/20"
            />
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.scheduleEnabled}
              onChange={(e) => updateField("scheduleEnabled", e.target.checked)}
              className="mt-1 accent-[#154734]"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900">Programar vigencia</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Si no se activa, la publicidad estará disponible sin límite de fechas
              </span>
            </span>
          </label>

          {form.scheduleEnabled ? (
            <div className="space-y-4 pl-1">
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.scheduleMode === "SINGLE_DAY"}
                    onChange={() => updateField("scheduleMode", "SINGLE_DAY" as AdvertisingScheduleMode)}
                    className="accent-[#154734]"
                  />
                  <span className="text-sm">Un día específico</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.scheduleMode === "DATE_RANGE"}
                    onChange={() => updateField("scheduleMode", "DATE_RANGE" as AdvertisingScheduleMode)}
                    className="accent-[#154734]"
                  />
                  <span className="text-sm">Rango de fechas</span>
                </label>
              </div>

              {form.scheduleMode === "SINGLE_DAY" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <CasaVerdeDatePicker
                      label="Fecha"
                      value={form.singleDayDate}
                      minDate={todayIso}
                      onChange={(v) => updateField("singleDayDate", v)}
                    />
                    {scheduleDateInvalid ? (
                      <p className="text-xs text-red-600">La fecha no puede ser anterior a hoy</p>
                    ) : null}
                  </div>
                  <CasaVerdeTimePicker
                    label="Hora inicio"
                    value={form.startTime}
                    onChange={(v) => updateField("startTime", v)}
                  />
                  <CasaVerdeTimePicker
                    label="Hora fin"
                    value={form.endTime}
                    onChange={(v) => updateField("endTime", v)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CasaVerdeDatePicker
                    label="Desde"
                    value={form.fromDate}
                    minDate={todayIso}
                    onChange={(v) => updateField("fromDate", v)}
                  />
                  <CasaVerdeDatePicker
                    label="Hasta"
                    value={form.toDate}
                    minDate={form.fromDate || todayIso}
                    onChange={(v) => updateField("toDate", v)}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
            className="accent-[#154734]"
          />
          <span className="text-sm font-semibold text-gray-900">Activar al guardar</span>
        </label>

        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || scheduleDateInvalid}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#154734] text-white text-sm font-bold rounded-xl hover:bg-[#103a2a] disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {editingId ? "Guardar cambios" : "Crear publicidad"}
        </button>
      </section>

      <section className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3 xl:sticky xl:top-6 h-fit">
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase">Vista previa</p>
          {form.name.trim() ? (
            <p className="text-[11px] text-gray-400 truncate" title={form.name}>
              Admin: {form.name}
            </p>
          ) : null}
        </div>
        <PromoPopupPreview
          headline={form.headline}
          subtitle={form.subtitle}
          couponCode={form.couponCode}
          disclaimer={form.disclaimer}
          ctaText={form.ctaText}
          onCopy={() => onCopyCode(form.couponCode)}
        />
      </section>
    </div>
  );
}
