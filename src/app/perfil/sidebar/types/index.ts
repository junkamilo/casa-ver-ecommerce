// ── Dominio ───────────────────────────────────────────────────────────────────

export type ProfileSection = "perfil" | "pedidos" | "direcciones";

// ── Hook useProfileNav ────────────────────────────────────────────────────────

export interface UseProfileNavResult {
  activeSection: ProfileSection;
  setActiveSection: (section: ProfileSection) => void;
  isActive: (section: ProfileSection) => boolean;
}
