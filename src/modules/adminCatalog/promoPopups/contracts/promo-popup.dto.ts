export type PromoPopupPlacement = "HOME" | "PRODUCT" | "CHECKOUT";

export interface PromoPopupScheduleFields {
  scheduleMode: "NONE" | "SINGLE_DAY" | "DATE_RANGE";
  validFrom: string | null;
  validTo: string | null;
}

export interface PromoPopupListItemDTO {
  id: string;
  name: string;
  placement: PromoPopupPlacement;
  isActive: boolean;
  headline: string;
  subtitle: string;
  couponCode: string;
  disclaimer: string;
  ctaText: string;
  ctaUrl: string;
  delaySeconds: number;
  scheduleLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoPopupListResponseDTO {
  data: PromoPopupListItemDTO[];
}

export interface PromoPopupDetailDTO extends PromoPopupListItemDTO {
  scheduleMode: "NONE" | "SINGLE_DAY" | "DATE_RANGE";
  validFrom: string | null;
  validTo: string | null;
}

export interface ActivePromoPopupDTO {
  id: string;
  placement: PromoPopupPlacement;
  headline: string;
  subtitle: string;
  couponCode: string;
  disclaimer: string;
  ctaText: string;
  ctaUrl: string;
  delaySeconds: number;
}

export interface CreatePromoPopupInputDTO {
  name: string;
  placement: PromoPopupPlacement;
  isActive?: boolean;
  headline: string;
  subtitle: string;
  couponCode: string;
  disclaimer: string;
  ctaText: string;
  ctaUrl: string;
  delaySeconds: number;
  scheduleEnabled: boolean;
  scheduleMode?: "SINGLE_DAY" | "DATE_RANGE";
  singleDayDate?: string;
  startTime?: string;
  endTime?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UpdatePromoPopupInputDTO extends CreatePromoPopupInputDTO {
  id: string;
}

export interface TogglePromoPopupInputDTO {
  id: string;
  isActive: boolean;
}

export interface DeletePromoPopupInputDTO {
  id: string;
}
