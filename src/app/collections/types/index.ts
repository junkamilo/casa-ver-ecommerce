export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export interface CategoriesClientProps {
  categories: Category[];
}
