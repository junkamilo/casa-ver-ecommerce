export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface OrderItemEmailData {
  name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  imageUrl?: string | null;
}

export interface SendOrderConfirmationEmailInput {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  items: OrderItemEmailData[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export interface SendVerificationEmailInput {
  customerEmail: string;
  customerName: string;
  code: string;
}

export interface SendPasswordResetEmailInput {
  customerEmail: string;
  customerName: string;
  resetUrl: string;
}

export interface SendWelcomeEmailInput {
  customerEmail: string;
  customerName: string;
}

export interface CartItemEmailData {
  name: string;
  price: number;
  imageUrl?: string | null;
  color?: string;
  size?: string;
}

export interface SendAbandonedCartEmailInput {
  customerEmail: string;
  items: CartItemEmailData[];
  cartUrl: string;
}

export interface SendAbandonedCheckoutEmailInput {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  items: CartItemEmailData[];
  total: number;
  paymentUrl: string;
}

export interface SendReviewRequestEmailInput {
  customerEmail: string;
  customerName: string;
  productName: string;
  productImageUrl?: string | null;
  orderNumber: string;
  reviewUrl: string; // URL con token mágico
}
