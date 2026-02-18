import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  show: boolean;
  onToggle: () => void;
  metaTitle: string;
  onMetaTitle: (v: string) => void;
  metaDescription: string;
  onMetaDescription: (v: string) => void;
}

export default function SeoSection({
  show,
  onToggle,
  metaTitle,
  onMetaTitle,
  metaDescription,
  onMetaDescription,
}: Props) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide w-full text-left"
      >
        SEO (Posicionamiento)
        {show ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {show && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Meta Título</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => onMetaTitle(e.target.value)}
              placeholder="Título para buscadores (max 60 caracteres)"
              maxLength={60}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Meta Descripción</label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => onMetaDescription(e.target.value)}
              placeholder="Descripción para buscadores (max 160 caracteres)"
              maxLength={160}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] outline-none resize-none"
            />
          </div>
        </div>
      )}
    </section>
  );
}
