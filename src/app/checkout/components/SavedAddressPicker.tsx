"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useFormContext } from "react-hook-form";
import { MapPin, ChevronDown, Star } from "lucide-react";
import type { CheckoutFormData } from "../hooks/useCheckout";

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  addressDetail: string | null;
  isDefault: boolean;
}

export function SavedAddressPicker() {
  const { status } = useSession();
  const { setValue } = useFormContext<CheckoutFormData>();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/profile/addresses")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SavedAddress[]) => {
        setAddresses(data);
        // Pre-seleccionar la predeterminada
        const def = data.find((a) => a.isDefault);
        if (def) {
          setSelected(def.id);
          applyAddress(def);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function applyAddress(addr: SavedAddress) {
    const [firstName, ...rest] = addr.fullName.split(" ");
    setValue("firstName", firstName ?? "", { shouldValidate: true });
    setValue("lastName", rest.join(" ") ?? "", { shouldValidate: true });
    setValue("phone", addr.phone, { shouldValidate: true });
    setValue("address", addr.address, { shouldValidate: true });
    setValue("addressDetail", addr.addressDetail ?? "", {
      shouldValidate: true,
    });
    setValue("city", addr.city, { shouldValidate: true });
    setValue("department", addr.department, { shouldValidate: true });
    setValue("savedAddressId", addr.id);
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelected(id);
    if (!id) {
      setValue("savedAddressId", undefined);
      return;
    }
    const addr = addresses.find((a) => a.id === id);
    if (addr) applyAddress(addr);
  }

  if (status !== "authenticated" || !loaded || addresses.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 p-4 bg-[#154734]/4 border border-[#154734]/15 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-3.5 h-3.5 text-[#154734]" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#154734]">
          Usar dirección guardada
        </span>
      </div>

      <div className="relative">
        <select
          value={selected}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-[#154734]/20 rounded-xl text-sm text-[#154734] appearance-none outline-none focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all cursor-pointer pr-8"
        >
          <option value="">— Ingresar dirección manualmente —</option>
          {addresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.isDefault ? "★ " : ""}
              {a.fullName} · {a.address}, {a.city}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50 pointer-events-none" />
      </div>

      {selected && (() => {
        const addr = addresses.find((a) => a.id === selected);
        return addr ? (
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            {addr.isDefault && (
              <Star className="w-3 h-3 fill-[#C19A6B] text-[#C19A6B] shrink-0" />
            )}
            {addr.address}
            {addr.addressDetail ? `, ${addr.addressDetail}` : ""} ·{" "}
            {addr.city}, {addr.department}
          </p>
        ) : null;
      })()}
    </div>
  );
}
