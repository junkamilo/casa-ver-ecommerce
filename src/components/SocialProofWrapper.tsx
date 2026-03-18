"use client";

import { usePathname } from "next/navigation";
import SocialProofPopup from "./SocialProofPopup";

export default function SocialProofWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <SocialProofPopup />;
}
