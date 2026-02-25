import { useState } from "react";
import { ProfileSection } from "../types";

export interface UseProfileNavResult {
  activeSection: ProfileSection;
  setActiveSection: (section: ProfileSection) => void;
  isActive: (section: ProfileSection) => boolean;
}

export function useProfileNav(initial: ProfileSection = "perfil"): UseProfileNavResult {
  const [activeSection, setActiveSection] = useState<ProfileSection>(initial);

  const isActive = (section: ProfileSection) => activeSection === section;

  return { activeSection, setActiveSection, isActive };
}
