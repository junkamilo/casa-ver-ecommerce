import { ExternalLink, Mail, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import PosManagedNotice from "@/app/admin/components/PosManagedNotice";
import { posUsersUrl } from "@/lib/pos-links";

/**
 * Perfil del administrador: los admins de la web viven en el POS (Configuraciones → Usuarios), con la misma
 * contraseña del POS. Aquí solo se muestran; el nombre, el correo y la contraseña se cambian en el POS.
 */
export default async function AdminPerfil() {
  const session = await auth();
  const name = session?.user?.name ?? "Administrador";
  const email = session?.user?.email ?? "";

  return (
    <div className="space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <AdminPageHeader title="Mi Perfil" />

      <div className="mx-auto max-w-xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#154734] to-[#1a5c43] p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#C19A6B] text-white flex items-center justify-center font-bold text-3xl border-4 border-white/30 shadow-lg mb-4">
              {name.charAt(0).toUpperCase() || "A"}
            </div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
              {name}
            </h2>
            <p className="text-white/60 text-sm mt-1">{email}</p>
            <span className="mt-3 text-xs bg-[#C19A6B] text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Administrador
            </span>
          </div>

          <div className="p-5 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-400 text-xs">Correo de acceso</p>
                <p className="text-gray-700 font-medium">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-400 text-xs">Contraseña</p>
                <p className="text-gray-700 font-medium">La misma del POS</p>
              </div>
            </div>
          </div>
        </div>

        <PosManagedNotice section="Usuarios" />

        <a
          href={posUsersUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#154734] px-5 py-3 text-sm font-semibold text-white hover:bg-[#154734]/90"
        >
          Cambiar nombre o contraseña en el POS
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
