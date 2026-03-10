import { Video } from "lucide-react";
import VideoUpload from "@/components/ui/video-upload";

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
            Video <span className="normal-case font-normal text-gray-400">(opcional)</span>
          </label>
        </div>
        <VideoUpload value={videoUrl} onChange={onVideoUrl} disabled={disabled} />
      </div>
    </section>
  );
}
