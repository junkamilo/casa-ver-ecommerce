export function generateGarmentTypeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
