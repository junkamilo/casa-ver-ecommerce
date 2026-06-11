export interface SearchInputDTO {
    query: string;
    ip: string;
  }
  
  export interface ProductSearchResultDTO {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
  }