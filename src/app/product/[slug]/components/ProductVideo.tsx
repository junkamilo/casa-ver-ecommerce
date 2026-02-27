"use client";

import { useState } from "react";

interface Props {
  url: string;
}

function normalizeCloudinaryVideoUrl(url: string): string {
  return url.replace(/\.(mov|avi|webm|mkv)(\?.*)?$/, ".mp4$2");
}

export default function ProductVideo({ url }: Props) {
  const [hasError, setHasError] = useState(false);
  const normalizedUrl = normalizeCloudinaryVideoUrl(url);

  if (hasError) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-400">Video no disponible.</p>
      </div>
    );
  }

  return (
    <video
      src={normalizedUrl}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onError={() => setHasError(true)}
      // Aquí está la magia: w-full h-full y object-cover forzarán el formato vertical
      className="w-full h-full object-cover absolute inset-0" 
    />
  );
}
