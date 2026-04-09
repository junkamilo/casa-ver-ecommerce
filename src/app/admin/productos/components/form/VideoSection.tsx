import VideoUpload from "@/components/ui/video-upload";
import { VideoSectionProps } from "../../types";

export default function VideoSection({ videoUrl, onVideoUrl, disabled }: VideoSectionProps) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <VideoUpload value={videoUrl} onChange={onVideoUrl} disabled={disabled} />
    </div>
  );
}
