import Image from "next/image";
import { ShieldCheck, User } from "lucide-react";
import { SidebarUser } from "../types";

interface Props {
  user: SidebarUser;
}

export function SidebarUserCard({ user }: Props) {
  return (
    <div className="p-5 border-b border-gray-100">
      <div className="flex flex-col items-center text-center gap-3">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? ""}
            width={64}
            height={64}
            className="rounded-full border-2 border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#154734] text-white flex items-center justify-center font-bold text-xl shadow-sm">
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
        )}

        <div className="w-full">
          <p className="text-sm font-bold text-gray-900 truncate">{user.name ?? "Usuario"}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
            {user.role === "ADMIN" ? (
              <>
                <ShieldCheck className="w-3 h-3" />
                Administrador
              </>
            ) : (
              <>
                <User className="w-3 h-3" />
                Cliente
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
