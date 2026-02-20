import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ProfileSection, SidebarUser } from "../types";
import { SIDEBAR_NAV_ITEMS } from "../constants";
import { SidebarUserCard } from "./SidebarUserCard";
import { SidebarNavItem } from "./SidebarNavItem";

interface Props {
  user: SidebarUser;
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  isAdmin?: boolean;
}

export function ProfileSidebar({ user, activeSection, onSectionChange, isAdmin }: Props) {
  return (
    <>
      {/* ── Desktop sidebar (lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-8 h-fit">
        <SidebarUserCard user={user} />

        <nav className="p-3 space-y-1" aria-label="Secciones del perfil">
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
            />
          ))}
        </nav>

        <div className="p-3 pt-1 mt-auto border-t border-gray-100 space-y-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#C19A6B] hover:bg-[#C19A6B]/10 transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-[#C19A6B]/10 group-hover:bg-[#C19A6B]/20 transition-colors shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p>Panel Admin</p>
                <p className="text-[11px] mt-0.5 text-[#C19A6B]/70">Gestionar la tienda</p>
              </div>
            </Link>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-400 hover:text-[#154734] transition-colors rounded-xl hover:bg-gray-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* ── Mobile tab bar (< lg) ────────────────────────── */}
      <div className="lg:hidden bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex" role="tablist" aria-label="Secciones del perfil">
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              mobile
            />
          ))}
        </div>
      </div>
    </>
  );
}
