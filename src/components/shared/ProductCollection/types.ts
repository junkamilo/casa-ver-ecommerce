export interface CollectionProduct {
  images: string[];
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  slug: string;
  colors?: { name: string; hexCode: string; imageUrl?: string | null }[];
  isSet?: boolean;
  minPrice?: number;
}

export interface FilterOptions {
  availableColors: { name: string; hexCode: string }[];
  maxPriceDb: number;
}
