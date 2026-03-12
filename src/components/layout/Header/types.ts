export interface NavSubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: NavSubcategory[];
}
