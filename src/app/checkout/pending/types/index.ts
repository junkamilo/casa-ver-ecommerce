export interface BankInfo {
  name: string;
  detail: string;
  color: string;
}

export interface PendingOrder {
  orderNumber: string;
  total: unknown;
  shippingName: string;
}
