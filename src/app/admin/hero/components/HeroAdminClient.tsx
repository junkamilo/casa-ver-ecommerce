"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { HeroSettingsUiModel } from "@/modules/hero/presentation/mappers";
import type { HeroSlideData } from "../types";
import HeroPreviewPanel from "./HeroPreviewPanel";
import HeroSlidesClient from "./HeroSlidesClient";
import HeroTimingPanel from "./HeroTimingPanel";

type TabId = "slides" | "preview" | "timing";

type Props = {
  slides: HeroSlideData[];
  settings: HeroSettingsUiModel;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "slides", label: "Slides" },
  { id: "preview", label: "Vista previa" },
  { id: "timing", label: "Temporización" },
];

export default function HeroAdminClient({
  slides: initialSlides,
  settings: initialSettings,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("slides");
  const [slides, setSlides] = useState(initialSlides);
  const [settings, setSettings] = useState(initialSettings);
  const [createNonce, setCreateNonce] = useState(0);

  function goToSlidesAndCreate() {
    setActiveTab("slides");
    setCreateNonce((n) => n + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold -mb-px transition-colors ${
                activeTab === tab.id
                  ? "text-[#154734] border-b-2 border-[#154734]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== "timing" ? (
          <button
            type="button"
            onClick={goToSlidesAndCreate}
            className="inline-flex items-center justify-center gap-2 self-end sm:self-auto px-4 py-2.5 rounded-xl bg-[#154734] text-white text-sm font-semibold hover:bg-[#103a2a] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar slide
          </button>
        ) : null}
      </div>

      <div className={activeTab === "slides" ? "block" : "hidden"}>
        <HeroSlidesClient
          slides={slides}
          onSlidesChange={setSlides}
          createNonce={createNonce}
          hideAddButton
        />
      </div>

      {activeTab === "preview" ? (
        <HeroPreviewPanel
          slides={slides}
          slideDurationMs={settings.slideDurationMs}
        />
      ) : null}

      {activeTab === "timing" ? (
        <HeroTimingPanel settings={settings} onSettingsChange={setSettings} />
      ) : null}
    </div>
  );
}
