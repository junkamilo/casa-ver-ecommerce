import { Category } from "../../types";

interface Props {
  name: string; onName: (v: string) => void;
  description: string; onDescription: (v: string) => void;
  categoryId: string; onCategory: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  isFeatured: boolean; onFeatured: (v: boolean) => void;
  isNew: boolean; onNew: (v: boolean) => void;
  categories: Category[];
}

const inputCls =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm";

export default function GeneralInfoSection({
  name, onName,
  description, onDescription,
  categoryId, onCategory,
  status, onStatus,
  isFeatured, onFeatured,
  isNew, onNew,
  categories,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Nombre del Producto *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Ej: Conjunto Lino Premium"
          required
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Descripción *
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder="Describe el producto..."
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none resize-none text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Categoría *
          </label>
          <select
            value={categoryId}
            onChange={(e) => onCategory(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 bg-white outline-none text-sm"
          >
            <option value="">Seleccionar...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 bg-white outline-none text-sm"
          >
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="DRAFT">Borrador</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6 pt-1">
        {[
          { label: "Producto Destacado", value: isFeatured, onChange: onFeatured },
          { label: "Marcar como Nuevo", value: isNew, onChange: onNew },
        ].map(({ label, value, onChange }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#154734] focus:ring-[#154734] accent-[#154734]"
            />
            <span className="text-sm text-gray-600">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
