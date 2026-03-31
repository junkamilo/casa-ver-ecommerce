"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FormProvider } from "react-hook-form";
import { useCheckout } from "./hooks/useCheckout";
import CheckoutMobileSummary from "./components/CheckoutMobileSummary";
import CheckoutHeader from "./components/CheckoutHeader";
import ContactSection from "./components/ContactSection";
import DeliverySection from "./components/DeliverySection";
import { AuthenticatedDelivery } from "./components/AuthenticatedDelivery";
import PaymentSection from "./components/PaymentSection";
import BillingSection from "./components/BillingSection";
import CheckoutSubmitButton from "./components/CheckoutSubmitButton";
import CheckoutFooterLinks from "./components/CheckoutFooterLinks";
import OrderSummaryPanel from "./components/OrderSummaryPanel";
import type { CheckoutFormData } from "./types/schema";

export default function CheckoutPage() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Controla si el usuario autenticado (sin direcciones previas) quiere
  // guardar su dirección al completar la compra.
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Guardar automáticamente la dirección SOLO si:
  // 1. El usuario está autenticado
  // 2. Activó el toggle de auto-guardar
  // 3. No seleccionó una dirección existente (escribió una nueva)
  const onBeforePayment = useCallback(
    async (data: CheckoutFormData) => {
      if (!isAuthenticated || !autoSaveEnabled || data.savedAddressId) return;

      await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${data.firstName} ${data.lastName}`,
          cedula: data.cedula || undefined,
          phone: data.phone,
          department: data.department,
          city: data.city,
          address: data.address,
          addressDetail: data.addressDetail || undefined,
          isDefault: true,
        }),
      });
    },
    [isAuthenticated, autoSaveEnabled]
  );

  const {
    form,
    items,
    subtotal,
    discount,
    couponDiscount,
    earlyBirdDiscount,
    earlyBird,
    total,
    coupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    isPending,
    submitError,
    onSubmit,
  } = useCheckout({ onBeforePayment });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className="min-h-screen bg-[#FAFAFA] flex flex-col lg:flex-row font-sans selection:bg-[#C19A6B]/20 relative overflow-hidden"
      >
        <CheckoutMobileSummary
          items={items}
          subtotal={subtotal}
          discount={discount}
          couponDiscount={couponDiscount}
          earlyBirdDiscount={earlyBirdDiscount}
          earlyBirdActive={earlyBird.hasDiscount}
          total={total}
          coupon={coupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />

        <div className="flex-1 lg:w-[55%] flex flex-col px-4 sm:px-8 lg:px-12 xl:px-20 pt-8 lg:pt-16 pb-28 lg:pb-20 bg-[#FAFAFA] relative z-10">
          {/* Fondo punteado decorativo */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#154734 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <CheckoutHeader />

          <div className="max-w-2xl w-full relative z-10">
            <ContactSection />

            {isAuthenticated ? (
              <AuthenticatedDelivery onAutoSaveChange={setAutoSaveEnabled} />
            ) : (
              <DeliverySection />
            )}

            <PaymentSection />
            <BillingSection />

            {submitError && (
              <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                {submitError}
              </div>
            )}

            <CheckoutSubmitButton isPending={isPending} />
            <CheckoutFooterLinks />
          </div>
        </div>

        <OrderSummaryPanel
          items={items}
          subtotal={subtotal}
          discount={discount}
          couponDiscount={couponDiscount}
          earlyBirdDiscount={earlyBirdDiscount}
          earlyBirdActive={earlyBird.hasDiscount}
          total={total}
          coupon={coupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />
      </form>
    </FormProvider>
  );
}
