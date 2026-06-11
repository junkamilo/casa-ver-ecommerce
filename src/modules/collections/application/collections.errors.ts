export class CategoryNotFoundError extends Error {
  public readonly slug: string;

  constructor(slug: string, message?: string) {
    super(message ?? `Category not found: ${slug}`);
    this.name = "CategoryNotFoundError";
    this.slug = slug;
  }
}
