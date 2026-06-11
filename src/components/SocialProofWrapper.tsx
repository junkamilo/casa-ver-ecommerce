"use client";

import { usePathname } from "next/navigation";
import SocialProofPopup from "./SocialProofPopup";
import { useLaunchLockGate } from "@/hooks/use-launch-lock-gate";

export default function SocialProofWrapper() {
  const pathname = usePathname();
  const { shouldHideGlobalWidgets } = useLaunchLockGate();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
    return null;
  }
  if (shouldHideGlobalWidgets) return null;

  return <SocialProofPopup />;
}
