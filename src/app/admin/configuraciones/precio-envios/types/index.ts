import type { ShippingRateDTO } from "@/modules/shipping/contracts/shipping.dto";

export type { ShippingRateDTO };

export interface ShippingRateFieldProps {
  label: string;
  subtitle?: string;
  accentClass: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
}

export interface ShippingPreviewProps {
  rates: ShippingRateDTO[];
  freeShippingMinSubtotal: number;
}
