"use client";

import { usePathname } from "next/navigation";
import SocialProofPopup from "./SocialProofPopup";
import { useLaunchLockGate } from "@/hooks/use-launch-lock-gate";
import { isStorefrontBrowsePath } from "@/lib/storefront-popups";

/**
 * Toast “X compró Y”.
 * Misma superficie de compra que InterestPopup.
 * `key={pathname}` reinicia el ciclo al entrar a cada página (SPA o refresh).
 */
export default function SocialProofWrapper() {
  const pathname = usePathname();
  const { shouldHideGlobalWidgets } = useLaunchLockGate();

  if (!isStorefrontBrowsePath(pathname)) return null;
  if (shouldHideGlobalWidgets) return null;

  return <SocialProofPopup key={pathname ?? "social"} />;
}
