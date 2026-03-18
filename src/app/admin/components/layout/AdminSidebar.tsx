import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { ADMIN_NAV } from "../../constants";

interface Props {
  pathname: string;
  userName: string | null | undefined;
  userInitial: string;
}

export default function AdminSidebar({ pathname, userName, userInitial }: Props) {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-[#154734] text-white shadow-xl z-20">

      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-[#C19A6B]/50 shadow-sm">
          <Image src={logoIcon} alt="CV" fill className="object-cover" priority />
        </div>
        <div className="flex flex-col">
          <h1
            className="text-lg font-bold tracking-wide text-white leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Casa Verde
          </h1>
          <span className="text-[10px] font-bold tracking-widest text-[#C19A6B] uppercase mt-1">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-white text-[#154734] shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive ? "text-[#154734]" : "text-white/70 group-hover:text-white"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: usuario + link tienda */}
      <div className="p-4 border-t border-white/10 bg-[#0f3626]/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-[#C19A6B] text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-[#154734]">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-white/50 truncate">Administrador</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors"
        >
          <Store className="w-4 h-4" />
          Ir a la Tienda
        </Link>
      </div>
    </aside>
  );
}
