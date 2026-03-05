import { Video } from "lucide-react";

interface Props {
  videoUrl: string;
  onVideoUrl: (v: string) => void;
  disabled: boolean;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
    {children}
  </h3>
);

export default function VideoSection({ videoUrl, onVideoUrl, disabled }: Props) {
  return (
    <section className="space-y-4">
      <SectionTitle>Video del Producto</SectionTitle>
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-gray-400" />
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            URL del video <span className="normal-case font-normal text-gray-400">(opcional)</span>
          </label>
        </div>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => onVideoUrl(e.target.value)}
          disabled={disabled}
          placeholder="https://..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734] disabled:opacity-50"
        />
        {videoUrl && (
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg border border-gray-200 max-h-64 object-contain bg-black"
          />
        )}
      </div>
    </section>
  );
}
