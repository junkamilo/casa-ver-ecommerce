import Image from "next/image";
import { Mail, Loader2, Trash2 } from "lucide-react";
import { formatDate } from "../constants/constants";
import type { AdminTableProps } from "../types/types";

const AdminTable = ({
  filteredAdmins,
  currentUserId,
  confirmDelete,
  deleting,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
}: AdminTableProps) => (
  <table className="w-full">
    <thead>
      <tr className="bg-[#F8F9FA] border-b border-gray-200">
        <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">
          Administrador
        </th>
        <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">
          Email
        </th>
        <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">
          Fecha de Alta
        </th>
        <th className="sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[0_1px_0_0_rgba(229,231,235,1)]">
          Acciones
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {filteredAdmins.map((admin) => (
        <tr key={admin.id} className="hover:bg-gray-50/60 transition-colors group">
          <td className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                {admin.image ? (
                  <Image src={admin.image} alt={admin.name || "Admin"} fill className="object-cover" />
                ) : (
                  <span className="font-bold text-[#154734]">
                    {admin.name?.charAt(0).toUpperCase() || "A"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  {admin.name || "Sin nombre"}
                  {admin.id === currentUserId && (
                    <span className="text-[10px] font-bold bg-[#C19A6B]/10 text-[#C19A6B] border border-[#C19A6B]/20 px-2 py-0.5 rounded-full">
                      TÚ
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">ID: {admin.id.slice(0, 8)}...</p>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {admin.email}
            </div>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              {formatDate(admin.createdAt)}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            {admin.id !== currentUserId ? (
              confirmDelete === admin.id ? (
                <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-2">
                  <span className="text-xs text-gray-500 font-medium mr-1">¿Seguro?</span>
                  <button
                    onClick={onCancelDelete}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => onDelete(admin.id)}
                    disabled={deleting}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-1"
                  >
                    {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                    Revocar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onConfirmDelete(admin.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                  title="Revocar acceso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            ) : (
              <span className="text-xs text-gray-400 italic pr-2">Sesión actual</span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AdminTable;
