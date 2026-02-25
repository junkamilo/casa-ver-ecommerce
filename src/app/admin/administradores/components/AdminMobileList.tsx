import Image from "next/image";
import { Trash2 } from "lucide-react";
import { formatDate } from "../constants/constants";
import type { Admin } from "../types/types";

interface AdminMobileListProps {
  filteredAdmins: Admin[];
  currentUserId: string | undefined;
  confirmDelete: string | null;
  deleting: boolean;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onDelete: (id: string) => void;
}

const AdminMobileList = ({
  filteredAdmins,
  currentUserId,
  confirmDelete,
  deleting,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
}: AdminMobileListProps) => (
  <div className="divide-y divide-gray-100">
    {filteredAdmins.map((admin) => (
      <div key={admin.id} className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {admin.image ? (
                <Image src={admin.image} alt={admin.name || "Admin"} fill className="object-cover" />
              ) : (
                <span className="font-bold text-[#154734] text-lg">
                  {admin.name?.charAt(0).toUpperCase() || "A"}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {admin.name || "Sin nombre"}
                {admin.id === currentUserId && (
                  <span className="text-[10px] font-bold bg-[#C19A6B]/10 text-[#C19A6B] border border-[#C19A6B]/20 px-2 py-0.5 rounded-full">
                    TÚ
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500">{admin.email}</p>
            </div>
          </div>

          {admin.id !== currentUserId && (
            <button
              onClick={() => onConfirmDelete(admin.id)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            Miembro desde {formatDate(admin.createdAt)}
          </span>
          {confirmDelete === admin.id && (
            <div className="flex gap-2">
              <button
                onClick={onCancelDelete}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => onDelete(admin.id)}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg"
              >
                {deleting ? "..." : "Confirmar Revocación"}
              </button>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default AdminMobileList;
