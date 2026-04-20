export const dynamic = "force-dynamic";

import { Suspense } from "react";
import type { Period } from "./types/types";
import { EstadisticasHeader } from "./components/EstadisticasHeader";
import { EstadisticasContent } from "./components/EstadisticasContent";
import { EstadisticasLiveSection } from "./components/EstadisticasLiveSection";
import { EstadisticasLoadingSkeleton, LiveSectionSkeleton } from "./components/EstadisticasLoadingSkeleton";

interface PageProps {
  searchParams?: Promise<{ period?: string }>;
}

export default async function AdminEstadisticas({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = (params?.period || "week") as Period;

  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <Suspense fallback={null}>
        <EstadisticasHeader />
      </Suspense>

      {/* Sección en vivo — carga independiente, no depende del período */}
      <Suspense fallback={<LiveSectionSkeleton />}>
        <EstadisticasLiveSection />
      </Suspense>

      {/* Sección por período — se refetch al cambiar Hoy/Semana/Mes */}
      <Suspense fallback={<EstadisticasLoadingSkeleton />}>
        <EstadisticasContent period={period} />
      </Suspense>
    </div>
  );
}
