"use client";

import AdminPageHeader from "@/components/ui/AdminPageHeader";
import AdvertisingTab from "./components/AdvertisingTab";

/**
 * Popups de publicidad de la tienda (lo único de promociones que vive en la web). Los cupones y las
 * promociones se crean, programan, activan y auditan en el POS (Tienda → Promociones); el código que
 * anuncia cada popup debe existir allí.
 */
export default function AdminPopupsPage() {
  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <AdminPageHeader title="Popups" />
      <p className="mx-auto max-w-2xl text-center text-sm text-gray-500">
        Los cupones y las promociones se administran en el POS (Tienda → Promociones). Aquí solo se configuran
        los popups que los anuncian.
      </p>
      <AdvertisingTab />
    </div>
  );
}
