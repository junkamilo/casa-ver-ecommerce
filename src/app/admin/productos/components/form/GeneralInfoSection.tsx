import { Category } from "../../types";

interface Props {
  name: string; onName: (v: string) => void;
  description: string; onDescription: (v: string) => void;
  basePrice: string; onBasePrice: (v: string) => void;
  comparePrice: string; onComparePrice: (v: string) => void;
  categoryId: string; onCategory: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  isFeatured: boolean; onFeatured: (v: boolean) => void;
  isNew: boolean; onNew: (v: boolean) => void;
  categories: Category[];
}

const inputCls =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
    {children}
  </h3>
);

export default function GeneralInfoSection({
  name, onName,
  description, onDescription,
  basePrice, onBasePrice,
  comparePrice, onComparePrice,
  categoryId, onCategory,
  status, onStatus,
  isFeatured, onFeatured,
  isNew, onNew,
  categories,
}: Props) {
  return (
    <section className="space-y-4">
      <SectionTitle>Información General</SectionTitle>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Nombre del Producto *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Ej: Enterizo Tropical"
          required
          className={inputCls}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Descripción *</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder="Describe el producto..."
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Precio Base (COP) *</label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => onBasePrice(e.target.value)}
            placeholder="89900"
            required
            min="0"
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Precio Antes (tachado)</label>
          <input
            type="number"
            value={comparePrice}
            onChange={(e) => onComparePrice(e.target.value)}
            placeholder="120000"
            min="0"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Categoría *</label>
          <select
            value={categoryId}
            onChange={(e) => onCategory(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] bg-white outline-none"
          >
            <option value="">Seleccionar...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Estado</label>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] bg-white outline-none"
          >
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="DRAFT">Borrador</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {[
          { label: "Producto Destacado", value: isFeatured, onChange: onFeatured },
          { label: "Marcar como Nuevo", value: isNew, onChange: onNew },
        ].map(({ label, value, onChange }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#154734] focus:ring-[#154734]"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
