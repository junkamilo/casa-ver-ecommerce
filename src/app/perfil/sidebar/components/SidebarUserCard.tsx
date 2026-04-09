"use client";

import Image from "next/image";
import { ShieldCheck, User } from "lucide-react";
import { SidebarUserCardProps } from "../types";

export function SidebarUserCard({ user }: SidebarUserCardProps) {
  const initial = user.name?.charAt(0).toUpperCase() ?? "U";
  const roleLabel = user.role === "ADMIN" ? "Administrador" : "Cliente";

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name ?? ""}
          width={40}
          height={40}
          className="rounded-full border-2 border-white/30"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#C19A6B] text-white flex items-center justify-center font-bold text-base border-2 border-white/30">
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white truncate">{user.name ?? "Usuario"}</p>
        <p className="text-xs text-white/60 truncate">{user.email}</p>
        <span className="inline-flex items-center gap-1 text-xs text-white/80 mt-0.5">
          {user.role === "ADMIN" ? (
            <ShieldCheck className="w-3 h-3" />
          ) : (
            <User className="w-3 h-3" />
          )}
          {roleLabel}
        </span>
      </div>
    </div>
  );
}
