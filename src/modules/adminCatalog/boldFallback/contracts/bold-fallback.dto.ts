export interface BoldFallbackDetailDTO {
    orderId: string;
    orderNumber: string;
    boldStatus?: string;
    action: string;
  }
  
  export interface BoldFallbackResponseDTO {
    checked: number;
    updated: number;
    errors: number;
    details: BoldFallbackDetailDTO[];
  }
  
  export interface BoldTransactionStatusDTO {
    status?: string;
    boldPaymentId?: string;
    error?: string;
  }
  
  export interface RunBoldFallbackInputDTO {
    authorizationHeader: string | null;
    isDev: boolean;
    cronSecret?: string;
    fallbackSecret?: string;
    boldApiKey?: string;
  }