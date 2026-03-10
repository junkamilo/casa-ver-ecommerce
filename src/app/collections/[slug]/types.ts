export interface CollectionProduct {
  mediaUrl: string | null;
  hoverMediaUrl?: string | null;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  slug: string;
  colors?: { name: string; hexCode: string; imageUrl?: string | null }[];
}

export interface CategoryData {
  name: string;
  description?: string | null;
  bannerImage?: string | null;
}

export interface FilterOptions {
  availableColors: { name: string; hexCode: string }[];
  maxPriceDb: number;
}
