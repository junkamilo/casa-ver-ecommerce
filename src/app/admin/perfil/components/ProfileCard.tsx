import Image from "next/image";
import { Calendar, ShieldCheck } from "lucide-react";
import { formatDate } from "../constants/constants";
import type { UserProfile } from "../types/types";

interface ProfileCardProps {
  profile: UserProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-[#154734] to-[#1a5c43] p-8 flex flex-col items-center text-center">
        {profile.image ? (
          <Image
            src={profile.image}
            alt={profile.name || ""}
            width={96}
            height={96}
            className="rounded-full border-4 border-white/30 shadow-lg mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#C19A6B] text-white flex items-center justify-center font-bold text-3xl border-4 border-white/30 shadow-lg mb-4">
            {profile.name?.charAt(0).toUpperCase() || "A"}
          </div>
        )}
        <h2
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {profile.name || "Administrador"}
        </h2>
        <p className="text-white/60 text-sm mt-1">{profile.email}</p>
        <span className="mt-3 text-xs bg-[#C19A6B] text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
          Administrador
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-400 text-xs">Miembro desde</p>
            <p className="text-gray-700 font-medium">{formatDate(profile.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-400 text-xs">Rol</p>
            <p className="text-gray-700 font-medium">Super Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
}
