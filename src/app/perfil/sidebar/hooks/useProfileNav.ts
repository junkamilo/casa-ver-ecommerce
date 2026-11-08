"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProfileSection, UseProfileNavResult } from "../types";

const VALID_SECTIONS: ProfileSection[] = ["perfil", "pedidos", "direcciones"];

export function useProfileNav(initial: ProfileSection = "perfil"): UseProfileNavResult {
  const searchParams = useSearchParams();
  const paramSection = searchParams.get("section") as ProfileSection | null;
  const isValidParam = paramSection !== null && VALID_SECTIONS.includes(paramSection);

  const [activeSection, setActiveSection] = useState<ProfileSection>(
    isValidParam ? paramSection : initial
  );

  // Si cambia ?section= en la URL, se ajusta durante el render (sin efecto).
  const [prevParamSection, setPrevParamSection] = useState(paramSection);
  if (paramSection !== prevParamSection) {
    setPrevParamSection(paramSection);
    if (isValidParam) setActiveSection(paramSection);
  }

  const isActive = (section: ProfileSection) => activeSection === section;

  return { activeSection, setActiveSection, isActive };
}
