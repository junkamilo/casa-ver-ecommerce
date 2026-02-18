import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  show: boolean;
  onToggle: () => void;
  material: string;
  onMaterial: (v: string) => void;
  careInfo: string;
  onCareInfo: (v: string) => void;
}

export default function MaterialSection({
  show,
  onToggle,
  material,
  onMaterial,
  careInfo,
  onCareInfo,
}: Props) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide w-full text-left"
      >
        Material y Cuidado
        {show ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {show && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Material</label>
            <input
              type="text"
              value={material}
              onChange={(e) => onMaterial(e.target.value)}
              placeholder="Ej: 100% Algodón Orgánico"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Instrucciones de Cuidado
            </label>
            <textarea
              rows={3}
              value={careInfo}
              onChange={(e) => onCareInfo(e.target.value)}
              placeholder="Ej: Lavar a mano con agua fría. No usar secadora."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] outline-none resize-none"
            />
          </div>
        </div>
      )}
    </section>
  );
}
