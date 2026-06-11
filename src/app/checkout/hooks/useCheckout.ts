"use client";

// Re-export para preservar la API pública del hook (importado por
// src/app/checkout/page.tsx). La fuente única ahora vive en
// modules/checkout/presentation/hooks/use-checkout.ts.
export { useCheckout } from "@/modules/checkout/presentation/hooks/use-checkout";
export type { CheckoutFormData } from "@/modules/checkout/presentation/hooks/use-checkout";
