export const BRAND_GREEN = "#154734";
export const BG_COLOR = "#FAFAFA";
export const FONT_SERIF = "Georgia, serif";

export const POLL_INTERVAL_MS = 3000;
export const MAX_POLL_ATTEMPTS = 10;

export const QUERY_PARAMS = {
  boldOrderId: "bold-order-id",
  boldTxStatus: "bold-tx-status",
  referenceId: "reference_id",
  reference: "reference",
  ref: "ref",
} as const;

export const BOLD_VERIFY_ENDPOINT = "/api/payments/bold/verify";

export const ROUTES = {
  success: (orderId: string) => `/checkout/success?orderId=${orderId}`,
  checkout: "/checkout",
  home: "/",
} as const;
