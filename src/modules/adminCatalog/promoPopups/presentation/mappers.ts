import { formatCouponScheduleLabel } from "@/modules/checkout/domain/coupon-schedule";
import type {
  ActivePromoPopupDTO,
  PromoPopupDetailDTO,
  PromoPopupListItemDTO,
} from "../contracts/promo-popup.dto";

type PromoPopupRecord = {
  id: string;
  name: string;
  placement: "HOME" | "PRODUCT" | "CHECKOUT";
  isActive: boolean;
  headline: string;
  subtitle: string;
  couponCode: string;
  disclaimer: string;
  ctaText: string;
  ctaUrl: string;
  delaySeconds: number;
  scheduleMode: string;
  validFrom: Date | null;
  validTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export function mapPromoPopupToListItem(record: PromoPopupRecord): PromoPopupListItemDTO {
  return {
    id: record.id,
    name: record.name,
    placement: record.placement,
    isActive: record.isActive,
    headline: record.headline,
    subtitle: record.subtitle,
    couponCode: record.couponCode,
    disclaimer: record.disclaimer,
    ctaText: record.ctaText,
    ctaUrl: record.ctaUrl,
    delaySeconds: record.delaySeconds,
    scheduleLabel: formatCouponScheduleLabel({
      scheduleMode: record.scheduleMode,
      validFrom: record.validFrom,
      validTo: record.validTo,
    }),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapPromoPopupToDetail(record: PromoPopupRecord): PromoPopupDetailDTO {
  return {
    ...mapPromoPopupToListItem(record),
    scheduleMode: record.scheduleMode as PromoPopupDetailDTO["scheduleMode"],
    validFrom: toIso(record.validFrom),
    validTo: toIso(record.validTo),
  };
}

export function mapPromoPopupToActive(record: PromoPopupRecord): ActivePromoPopupDTO {
  return {
    id: record.id,
    placement: record.placement,
    headline: record.headline,
    subtitle: record.subtitle,
    couponCode: record.couponCode,
    disclaimer: record.disclaimer,
    ctaText: record.ctaText,
    ctaUrl: record.ctaUrl,
    delaySeconds: record.delaySeconds,
  };
}
