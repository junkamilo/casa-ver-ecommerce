/**
 * Rutas de navegación de compra donde sí deben mostrarse
 * SocialProof ("X compró…") e Interest ("Te podría interesar").
 */
export function isStorefrontBrowsePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;

  if (pathname === "/") return true;
  if (pathname.startsWith("/tienda")) return true;
  if (pathname.startsWith("/product/")) return true;
  if (pathname.startsWith("/collections")) return true;

  return false;
}

/** Slug del PDP actual, si aplica (para no sugerir el mismo producto). */
export function getProductSlugFromPath(pathname: string | null | undefined): string | null {
  if (!pathname?.startsWith("/product/")) return null;
  const slug = pathname.split("/")[2]?.trim();
  return slug || null;
}
