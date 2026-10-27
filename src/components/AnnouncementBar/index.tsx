"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Truck } from "lucide-react";
import { MARQUEE_COPIES, STYLES } from "./constants";
import { AnnouncementItem } from "./components";
import type { Announcement } from "./types";
import { FREE_SHIPPING_MIN_NET_SUBTOTAL } from "@/lib/shipping";

function formatThresholdCop(value: number): string {
  return value.toLocaleString("es-CO");
}

function buildFreeShippingAnnouncement(threshold: number): Announcement {
  return {
    text: `Envíos gratis por compras superiores a $${formatThresholdCop(threshold)}`,
    icon: Truck,
  };
}

export default function AnnouncementBar() {
  const [threshold, setThreshold] = useState(FREE_SHIPPING_MIN_NET_SUBTOTAL);
  // El POS puede pausar el envío gratis: entonces no se anuncia.
  const [freeShippingActive, setFreeShippingActive] = useState(true);
  const [seasonalText, setSeasonalText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/shipping-config", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { freeShippingThreshold?: number; freeShippingActive?: boolean } | null) => {
        if (!active) return;
        if (data?.freeShippingActive === false) setFreeShippingActive(false);
        const value = data?.freeShippingThreshold;
        if (typeof value === "number" && value > 0) {
          setThreshold(value);
        }
      })
      .catch(() => {
        // Mantener fallback local si la API no responde
      });

    fetch("/api/theme/active")
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (payload: {
          data?: {
            slug?: string;
            announcementBar?: { enabled?: boolean; text?: string | null };
          };
        } | null) => {
          if (!active) return;
          const theme = payload?.data;
          if (
            theme &&
            theme.slug !== "casa-verde" &&
            theme.announcementBar?.enabled &&
            theme.announcementBar.text?.trim()
          ) {
            setSeasonalText(theme.announcementBar.text.trim());
          }
        },
      )
      .catch(() => {
        // Mantener anuncio de envío por defecto
      });

    return () => {
      active = false;
    };
  }, []);

  const announcements = useMemo(() => {
    const items: Announcement[] = [];
    if (seasonalText) {
      items.push({ text: seasonalText, icon: Sparkles });
    }
    if (freeShippingActive) {
      items.push(buildFreeShippingAnnouncement(threshold));
    }
    return items;
  }, [freeShippingActive, seasonalText, threshold]);

  if (announcements.length === 0) return null;

  return (
    <div className="relative w-full select-none">
      {/* Línea de borde superior: degradado de acento que respira */}
      <div
        className="animate-border-shimmer h-[1.5px]"
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent, var(--theme-accent, #C19A6B), transparent)",
        }}
      />

      {/* Barra principal */}
      <div
        className="relative bg-[color:var(--theme-primary)] py-2.5 sm:py-3 flex items-center overflow-hidden group"
        style={STYLES.barBackground}
      >
        {/* Efecto Aurora */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={STYLES.aurora}
        />

        {/* Barrido de luz dorada */}
        <div
          className="absolute top-0 bottom-0 w-24 sm:w-32 pointer-events-none z-20 animate-shine-sweep"
          style={STYLES.shineSweep}
        />

        {/* Fades laterales */}
        <div
          className="absolute inset-y-0 left-0 w-20 sm:w-36 z-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--theme-primary, #154734), transparent)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-20 sm:w-36 z-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to left, var(--theme-primary, #154734), transparent)",
          }}
        />

        {/* Marquee */}
        <div
          className="flex whitespace-nowrap animate-marquee group-hover:paused will-change-transform"
          aria-label="Anuncios de la tienda"
        >
          {Array.from({ length: MARQUEE_COPIES }, (_, arrayIndex) => (
            <div key={arrayIndex} className="flex items-center">
              {announcements.map((item, index) => (
                <AnnouncementItem
                  key={`${arrayIndex}-${index}`}
                  item={item}
                  arrayIndex={arrayIndex}
                  index={index}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Línea de borde inferior */}
      <div
        className="h-px"
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--theme-accent, #C19A6B) 35%, transparent), transparent)",
        }}
      />
    </div>
  );
}
