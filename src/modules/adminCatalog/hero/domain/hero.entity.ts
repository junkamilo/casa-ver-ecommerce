export function isValidCloudinaryUrl(v: unknown): boolean {
    if (typeof v !== "string" || !v.trim()) return false;
    try {
      const u = new URL(v);
      return u.protocol === "https:" && u.hostname === "res.cloudinary.com";
    } catch {
      return false;
    }
  }