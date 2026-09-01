"use client";

import { useState } from "react";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import { PREVIEW_DEVICE_FRAMES } from "@/components/HeroSection/previewLayoutClasses";
import type { HeroPreviewLayout } from "@/components/HeroSection/types";
import { mapActiveAdminHeroSlidesToStorefront } from "@/modules/hero/presentation/map-to-storefront-slide";
import type { HeroSlideData } from "../types";

type Props = {
  slides: HeroSlideData[];
  slideDurationMs?: number;
};

const DEVICES: {
  id: HeroPreviewLayout;
  label: string;
  Icon: typeof Laptop;
}[] = [
  { id: "desktop", label: "Computador", Icon: Laptop },
  { id: "tablet", label: "Tablet", Icon: Tablet },
  { id: "mobile", label: "Celular", Icon: Smartphone },
];

export default function HeroPreviewPanel({
  slides,
  slideDurationMs = 6000,
}: Props) {
  const [device, setDevice] = useState<HeroPreviewLayout>("desktop");
  const previewSlides = mapActiveAdminHeroSlidesToStorefront(slides);
  const inactiveCount = slides.filter((s) => !s.isActive).length;
  const frame = PREVIEW_DEVICE_FRAMES[device];
  const isPhone = device === "mobile";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Vista previa</h2>
            <p className="mt-1 text-sm text-gray-500">
              Así se ve el banner en la página de inicio con los slides activos.
              {inactiveCount > 0
                ? ` ${inactiveCount} slide${inactiveCount === 1 ? "" : "s"} inactivo${inactiveCount === 1 ? "" : "s"} no se muestran.`
                : null}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 self-start">
            {DEVICES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDevice(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  device === id
                    ? "bg-[#154734] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {previewSlides.length === 0 ? (
          <div className="overflow-x-auto pb-2">
            <div className="mx-auto flex justify-center min-w-0">
              <div
                className={`shrink-0 bg-gray-900 shadow-lg overflow-hidden ${
                  isPhone
                    ? "rounded-[1.75rem] border-[10px] border-gray-800 ring-1 ring-gray-700"
                    : "rounded-xl border border-gray-200"
                }`}
                style={{ width: frame.width }}
              >
                <HeroSection
                  slides={[]}
                  previewLayout={device}
                  autoplay={false}
                  slideDurationMs={slideDurationMs}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="mx-auto flex justify-center min-w-0">
              <div
                className={`shrink-0 bg-gray-900 shadow-lg overflow-hidden ${
                  isPhone
                    ? "rounded-[1.75rem] border-[10px] border-gray-800 ring-1 ring-gray-700"
                    : device === "tablet"
                      ? "rounded-2xl border-[8px] border-gray-800"
                      : "rounded-xl border border-gray-700"
                }`}
                style={{ width: frame.width }}
              >
                {isPhone ? (
                  <div className="h-5 bg-gray-800 flex items-center justify-center">
                    <div className="h-1.5 w-16 rounded-full bg-gray-600" />
                  </div>
                ) : null}
                <HeroSection
                  slides={previewSlides}
                  previewLayout={device}
                  autoplay={previewSlides.length > 1}
                  slideDurationMs={slideDurationMs}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
