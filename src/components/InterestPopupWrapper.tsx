"use client";

import { usePathname } from "next/navigation";
import InterestPopup from "./InterestPopup";
import { useLaunchLockGate } from "@/hooks/use-launch-lock-gate";
import {
  getProductSlugFromPath,
  isStorefrontBrowsePath,
} from "@/lib/storefront-popups";

/**
 * Toast “Te podría interesar”.
 * Visible en home / tienda / producto / colecciones.
 * Oculto en admin, checkout, perfil, login, etc.
 * `key={pathname}` fuerza remount al navegar (también sin F5).
 */
export default function InterestPopupWrapper() {
  const pathname = usePathname();
  const { shouldHideGlobalWidgets } = useLaunchLockGate();

  if (!isStorefrontBrowsePath(pathname)) return null;
  if (shouldHideGlobalWidgets) return null;

  const excludeSlug = getProductSlugFromPath(pathname);

  return (
    <InterestPopup
      key={pathname ?? "interest"}
      excludeSlug={excludeSlug}
    />
  );
}
