import AdminPageHeader from "@/components/ui/AdminPageHeader";
import HeroAdminClient from "./components/HeroAdminClient";
import type { HeroSlideData } from "./types";
import { StoreIcon } from "@/components/icons";
import {
  fetchAdminHeroSettings,
  fetchAdminHeroSlides,
} from "@/modules/hero/presentation/fetch-admin-hero-slides";
import type { HeroSettingsUiModel } from "@/modules/hero/presentation/mappers";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const [slides, settings]: [HeroSlideData[], HeroSettingsUiModel] =
    await Promise.all([fetchAdminHeroSlides(), fetchAdminHeroSettings()]);

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      <AdminPageHeader
        title="Banners"
        action={{ label: "Ver tienda", href: "/", icon: StoreIcon }}
      />

      <HeroAdminClient slides={slides} settings={settings} />
    </div>
  );
}
