import { User, Mail, Loader2, Save, Edit3 } from "lucide-react";
import type { PersonalInfoSectionProps } from "../types/types";

export default function PersonalInfoSection({
  profile,
  editingName,
  name,
  savingName,
  onStartEdit,
  onNameChange,
  onSave,
  onCancel,
}: PersonalInfoSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3
        className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        <User className="w-5 h-5 text-[#154734]" />
        Información Personal
      </h3>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Nombre completo</label>
          {editingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm"
                autoFocus
              />
              <button
                onClick={onSave}
                disabled={savingName || !name.trim()}
                className="px-4 py-2.5 bg-[#154734] text-white rounded-lg text-sm font-medium hover:bg-[#103a2a] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingName ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
              <span className="text-sm text-gray-900 font-medium">
                {profile.name || "Sin nombre"}
              </span>
              <button
                onClick={onStartEdit}
                className="text-[#154734] hover:bg-[#154734]/10 p-1.5 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Correo electrónico</label>
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{profile.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
