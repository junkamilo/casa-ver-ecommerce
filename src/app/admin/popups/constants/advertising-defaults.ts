import type { PromoPopupPlacement } from "@/modules/adminCatalog/promoPopups/contracts/promo-popup.dto";
import type { AdvertisingScheduleMode } from "../hooks/useAdvertisingManager";

export const ADVERTISING_DEFAULT_FORM = {
  name: "",
  placement: "HOME" as PromoPopupPlacement,
  isActive: false,
  headline: "10% OFF",
  subtitle: "en tu primera compra",
  couponCode: "MIPRIMERACOMPRA",
  disclaimer: "Descuento exclusivo por tiempo limitado.",
  ctaText: "COMPRAR AHORA",
  ctaUrl: "/tienda",
  delaySeconds: 3,
  scheduleEnabled: false,
  scheduleMode: "SINGLE_DAY" as AdvertisingScheduleMode,
  singleDayDate: "",
  startTime: "",
  endTime: "",
  fromDate: "",
  toDate: "",
};

export type AdvertisingFormState = typeof ADVERTISING_DEFAULT_FORM;

export const ADVERTISING_PREVIEW_PLACEHOLDERS = {
  headline: "10% OFF",
  subtitle: "en tu primera compra",
  couponCode: "MIPRIMERACOMPRA",
  disclaimer: "Descuento exclusivo por tiempo limitado.",
  ctaText: "COMPRAR AHORA",
} as const;
