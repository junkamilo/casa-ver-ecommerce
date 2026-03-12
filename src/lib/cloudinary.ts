export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video"
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary: faltan variables NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Upload failed (${res.status})`);
  }

  const data = await res.json();
  const url: string = data.secure_url;

  if (resourceType === "video") {
    // Force mp4 delivery — convierte .mov/.hevc de iPhone al instante
    return url
      .replace("/upload/", "/upload/f_mp4/")
      .replace(/\.[^./]+$/, ".mp4");
  }

  // Imágenes: f_auto convierte HEIC/HEIF a webp/jpg automáticamente
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}
