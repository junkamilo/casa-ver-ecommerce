"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const REFRESH_INTERVAL_MS = 30_000;

interface Props {
  serverNow: string;
}

export function DashboardAutoRefresh({ serverNow }: Props) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date(serverNow));
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = () => {
    setSpinning(true);
    router.refresh();
    setLastUpdated(new Date());
    setTimeout(() => setSpinning(false), 800);
  };

  useEffect(() => {
    setLastUpdated(new Date(serverNow));
  }, [serverNow]);

  useEffect(() => {
    timerRef.current = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = lastUpdated.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 select-none">
      <span className="hidden sm:inline">Actualizado {label}</span>
      <button
        type="button"
        onClick={refresh}
        title="Actualizar ahora"
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 hover:border-[#154734] hover:text-[#154734] transition-all active:scale-90"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
        <span className="sm:hidden text-xs">Actualizar</span>
      </button>
    </div>
  );
}
