export type PaymentStatus = "loading" | "APPROVED" | "REJECTED" | "RUNNING" | "error";

export interface VerifyResult {
  status: PaymentStatus;
  orderId?: string;
}

export interface LoadingViewProps {
  isRunning?: boolean;
}

export interface ApprovedViewProps {
  orderId: string | undefined;
}
