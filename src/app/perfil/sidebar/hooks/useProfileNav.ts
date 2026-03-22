"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProfileSection } from "../types";

export interface UseProfileNavResult {
  activeSection: ProfileSection;
  setActiveSection: (section: ProfileSection) => void;
  isActive: (section: ProfileSection) => boolean;
}

export function useProfileNav(initial: ProfileSection = "perfil"): UseProfileNavResult {
  const searchParams = useSearchParams();
  const paramSection = searchParams.get("section") as ProfileSection | null;
  const validSections: ProfileSection[] = ["perfil", "pedidos", "direcciones"];
  const resolved =
    paramSection && validSections.includes(paramSection) ? paramSection : initial;

  const [activeSection, setActiveSection] = useState<ProfileSection>(resolved);

  useEffect(() => {
    if (paramSection && validSections.includes(paramSection)) {
      setActiveSection(paramSection);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramSection]);

  const isActive = (section: ProfileSection) => activeSection === section;

  return { activeSection, setActiveSection, isActive };
}
