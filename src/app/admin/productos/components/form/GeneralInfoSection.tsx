import { Category } from "../../types";
import { ProductFormErrors } from "../../schema";

interface Props {
  name: string; onName: (v: string) => void;
  description: string; onDescription: (v: string) => void;
  categoryId: string; onCategory: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  isFeatured: boolean; onFeatured: (v: boolean) => void;
  isNew: boolean; onNew: (v: boolean) => void;
  categories: Category[];
  errors?: ProductFormErrors;
}

const inputCls = (hasError = false) =>
  `w-full px-4 py-2.5 rounded-lg border ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#C19A6B] focus:ring-[#C19A6B]/10"
  } focus:ring-4 outline-none text-sm transition-colors`;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-sm mt-1">{msg}</p>;
}

export default function GeneralInfoSection({
  name, onName,
  description, onDescription,
  categoryId, onCategory,
  status, onStatus,
  isFeatured, onFeatured,
  isNew, onNew,
  categories,
  errors = {},
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
          className={inputCls(!!errors.name)}
        />
        <FieldError msg={errors.name} />
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
          className={`${inputCls(!!errors.description)} resize-none`}
        />
        <FieldError msg={errors.description} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Categoría *
          </label>
          <select
            value={categoryId}
            onChange={(e) => onCategory(e.target.value)}
            className={`${inputCls(!!errors.categoryId)} bg-white`}
          >
            <option value="">Seleccionar...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <FieldError msg={errors.categoryId} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className={`${inputCls()} bg-white`}
          >
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="DRAFT">Borrador</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 pt-1">
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
