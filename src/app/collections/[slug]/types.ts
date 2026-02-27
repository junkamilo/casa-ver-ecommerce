export interface CollectionProduct {
  mediaUrl: string | null;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  slug: string;
  colors?: { name: string; hexCode: string }[];
}

export interface CategoryData {
  name: string;
  description?: string | null;
  bannerImage?: string | null;
}
