"use client";

import { usePathname } from "next/navigation";
import SocialProofPopup from "./SocialProofPopup";

export default function SocialProofWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) return null;
  return <SocialProofPopup />;
}
