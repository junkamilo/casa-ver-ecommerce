import VideoUpload from "@/components/ui/video-upload";

interface Props {
  videoUrl: string;
  onVideoUrl: (v: string) => void;
  disabled: boolean;
}

export default function VideoSection({ videoUrl, onVideoUrl, disabled }: Props) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <VideoUpload value={videoUrl} onChange={onVideoUrl} disabled={disabled} />
    </div>
  );
}
