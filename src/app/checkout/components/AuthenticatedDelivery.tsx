"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { MapPin, Plus, ArrowLeft, Star, BookMarked } from "lucide-react";
import AdminSelect from "@/components/ui/AdminSelect";
import {
  SECTION_CLS,
  ACCENT_BAR_CLS,
  SECTION_TITLE_CLS,
} from "../constants";
import { DeliveryFormFields } from "./DeliveryFormFields";
import type { CheckoutFormData } from "../types/schema";
import type { SavedAddress } from "../types";

type LoadStatus = "loading" | "done";
type DeliveryMode = "cards" | "manual";

interface Props {
  /** Notifica al padre si el usuario quiere guardar la dirección nueva en su perfil */
  onAutoSaveChange: (enabled: boolean) => void;
}

export function AuthenticatedDelivery({ onAutoSaveChange }: Props) {
  const { setValue } = useFormContext<CheckoutFormData>();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [selectedId, setSelectedId] = useState<string>("");
  const [mode, setMode] = useState<DeliveryMode>("cards");
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    fetch("/api/profile/addresses")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SavedAddress[]) => {
        setAddresses(data);
        if (data.length > 0) {
          setMode("cards");
          const def = data.find((a) => a.isDefault) ?? data[0];
          setSelectedId(def.id);
          applyAddress(def);
        } else {
          setMode("manual");
        }
      })
      .catch(() => setMode("manual"))
      .finally(() => setLoadStatus("done"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function applyAddress(addr: SavedAddress) {
    const [firstName, ...rest] = addr.fullName.split(" ");
    setValue("firstName", firstName ?? "", { shouldValidate: true });
    setValue("lastName", rest.join(" ") ?? "", { shouldValidate: true });
    if (addr.cedula) setValue("cedula", addr.cedula, { shouldValidate: true });
    setValue("phone", addr.phone, { shouldValidate: true });
    setValue("address", addr.address, { shouldValidate: true });
    setValue("addressDetail", addr.addressDetail ?? "", { shouldValidate: true });
    setValue("city", addr.city, { shouldValidate: true });
    setValue("department", addr.department, { shouldValidate: true });
    setValue("savedAddressId", addr.id);
  }

  function clearForm() {
    setValue("firstName", "");
    setValue("lastName", "");
    setValue("cedula", "");
    setValue("phone", "");
    setValue("address", "");
    setValue("addressDetail", "");
    setValue("city", "");
    setValue("department", "");
    setValue("savedAddressId", undefined);
  }

  function handleSelectAddress(id: string) {
    const addr = addresses.find((a) => a.id === id);
    if (!addr) return;
    setSelectedId(id);
    applyAddress(addr);
  }

  function handleSwitchToManual() {
    setMode("manual");
    clearForm();
  }

  function handleBackToCards() {
    setMode("cards");
    const addr = addresses.find((a) => a.id === selectedId) ?? addresses[0];
    if (addr) applyAddress(addr);
  }

  function handleAutoSaveToggle(enabled: boolean) {
    setAutoSave(enabled);
    onAutoSaveChange(enabled);
  }

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------
  if (loadStatus === "loading") {
    return (
      <section className={SECTION_CLS}>
        <div className={ACCENT_BAR_CLS} />
        <h2
          className={`${SECTION_TITLE_CLS} mb-5 sm:mb-6`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-[#C19A6B] shrink-0" />
          Dirección de entrega
        </h2>
        <div className="space-y-3 animate-pulse">
          <div className="h-18 bg-gray-100 rounded-xl" />
          <div className="h-18 bg-gray-100 rounded-xl" />
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // FLUJO A — Selección de dirección guardada
  // ---------------------------------------------------------------------------
  if (mode === "cards") {
    const selectedAddr = addresses.find((a) => a.id === selectedId);

    return (
      <section className={SECTION_CLS}>
        <div className={ACCENT_BAR_CLS} />
        <h2
          className={`${SECTION_TITLE_CLS} mb-5 sm:mb-6`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-[#C19A6B] shrink-0" />
          Dirección de entrega
        </h2>

        <AdminSelect
          value={selectedId}
          onChange={handleSelectAddress}
          options={addresses.map((a) => ({
            value: a.id,
            label: `${a.isDefault ? "★ " : ""}${a.fullName} · ${a.city}`,
          }))}
          className="mb-4"
        />

        {selectedAddr && (
          <div className="mb-5 px-4 py-3 bg-[#154734]/4 border border-[#154734]/10 rounded-xl">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-semibold text-[#154734]">
                {selectedAddr.fullName}
              </span>
              {selectedAddr.isDefault && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-widest text-[#154734] bg-[#154734]/10 px-1.5 py-0.5 rounded-full">
                  <Star className="w-2 h-2 fill-[#154734]" />
                  Predeterminada
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {selectedAddr.address}
              {selectedAddr.addressDetail ? `, ${selectedAddr.addressDetail}` : ""}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedAddr.city}, {selectedAddr.department}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{selectedAddr.phone}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSwitchToManual}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#C19A6B] hover:text-[#154734] transition-colors py-1 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Usar otra dirección
        </button>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // FLUJO B — Formulario manual (sin direcciones o agregando una nueva)
  // ---------------------------------------------------------------------------
  const hasExistingAddresses = addresses.length > 0;

  return (
    <section className={SECTION_CLS}>
      <div className={ACCENT_BAR_CLS} />

      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2
          className={SECTION_TITLE_CLS}
          style={{ fontFamily: "Georgia, serif" }}
        >
          <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-[#C19A6B] shrink-0" />
          Dirección de entrega
        </h2>
        {hasExistingAddresses && (
          <button
            type="button"
            onClick={handleBackToCards}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#C19A6B] hover:text-[#154734] transition-colors active:scale-95 p-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Mis direcciones
          </button>
        )}
      </div>

      <DeliveryFormFields />

      {/* Toggle auto-guardar — solo cuando no tiene direcciones previas */}
      {!hasExistingAddresses && (
        <label className="flex items-start gap-3 mt-5 cursor-pointer select-none group">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={autoSave}
              onChange={(e) => handleAutoSaveToggle(e.target.checked)}
            />
            <div className="w-9 h-5 bg-gray-200 peer-checked:bg-[#154734] rounded-full transition-colors duration-200" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#154734] transition-colors flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 text-[#C19A6B] shrink-0" />
              Guardar dirección en mi cuenta
            </span>
            <p className="text-xs text-gray-400 mt-0.5">
              Para agilizar tus próximas compras
            </p>
          </div>
        </label>
      )}
    </section>
  );
}
