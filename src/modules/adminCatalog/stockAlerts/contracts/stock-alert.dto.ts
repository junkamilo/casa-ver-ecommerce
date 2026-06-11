export type StockAlertDTO = {
  type: "product" | "color";
  productId: string;
  productName: string;
  colorId?: string;
  colorName?: string;
};

export type StockAlertsQueryDTO = {
  page: number;
  limit: number;
};

export type StockAlertsResponseDTO = {
  alerts: StockAlertDTO[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};
