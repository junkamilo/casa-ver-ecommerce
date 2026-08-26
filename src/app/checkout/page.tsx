"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FormProvider } from "react-hook-form";
import { useCheckout } from "./hooks/useCheckout";
import { useAutoSaveAddress } from "./hooks/useAutoSaveAddress";
import CheckoutMobileSummary from "./components/CheckoutMobileSummary";
import CheckoutHeader from "./components/CheckoutHeader";
import ContactSection from "./components/ContactSection";
import DeliverySection from "./components/DeliverySection";
import { AuthenticatedDelivery } from "./components/AuthenticatedDelivery";
import PaymentSection from "./components/PaymentSection";
import BillingSection from "./components/BillingSection";
import MobileCouponSection from "./components/MobileCouponSection";
import CheckoutSubmitButton from "./components/CheckoutSubmitButton";
import OrderSummaryPanel from "./components/OrderSummaryPanel";
import GuestCheckoutModal from "./components/GuestCheckoutModal";
import CouponAppliedModal from "./components/CouponAppliedModal";
import FreeShippingAppliedModal from "./components/FreeShippingAppliedModal";

export default function CheckoutPage() {
  const { status: authStatus } = useSession();

  // guestMode: null = esperando decisión (muestra modal si no autenticado)
  //            true  = eligió "Continuar como invitado"
  const [guestMode, setGuestMode] = useState<boolean | null>(null);

  // Mostrar modal solo si el usuario NO está autenticado y aún no eligió
  const showModal = authStatus === "unauthenticated" && guestMode === null;

  useEffect(() => {
    if (authStatus === "authenticated" || guestMode === true) {
      try {
        sessionStorage.setItem("cv_checkout_promo_ready", "1");
      } catch {
        // sessionStorage no disponible
      }
    }
  }, [authStatus, guestMode]);

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const { saveAddress, isAuthenticated } = useAutoSaveAddress({ enabled: autoSaveEnabled });

  const {
    form,
    items,
    subtotal,
    shippingCost,
    shippingQuote,
    total,
    coupon,
    couponDiscount,
    lineItemDiscountPercentage,
    handleApplyCoupon,
    handleRemoveCoupon,
    showCouponCelebration,
    dismissCouponCelebration,
    showFreeShippingCelebration,
    dismissFreeShippingCelebration,
    isPending,
    submitError,
    onSubmit,
  } = useCheckout({ onBeforePayment: saveAddress });

  return (
    <FormProvider {...form}>
      {/* Modal interceptor para usuarios no autenticados */}
      {showModal && (
        <GuestCheckoutModal onContinueAsGuest={() => setGuestMode(true)} />
      )}

      <CouponAppliedModal
        open={showCouponCelebration}
        onClose={dismissCouponCelebration}
        discountPercentage={coupon.discountPercentage}
        discountType={coupon.discountType}
        discountValue={coupon.discountValue}
        couponDiscount={couponDiscount}
      />

      <FreeShippingAppliedModal
        open={showFreeShippingCelebration && !showModal && !showCouponCelebration}
        onClose={dismissFreeShippingCelebration}
        shippingSavings={shippingQuote.baseCost}
        threshold={shippingQuote.freeShippingThreshold ?? 0}
      />

      <form
        onSubmit={onSubmit}
        className="min-h-screen lg:h-dvh bg-[#FAFAFA] flex flex-col lg:flex-row font-sans selection:bg-[#C19A6B]/20"
      >
        <CheckoutMobileSummary
          items={items}
          subtotal={subtotal}
          shippingCost={shippingCost}
          shippingQuote={shippingQuote}
          total={total}
          coupon={coupon}
          couponDiscount={couponDiscount}
          lineItemDiscountPercentage={lineItemDiscountPercentage}
          isPending={isPending}
          hidden={showModal}
        />

        {/* ── PANEL IZQUIERDO: formulario con scroll propio ── */}
        <div className="flex-1 lg:w-[55%] lg:h-dvh lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent flex flex-col px-4 sm:px-8 lg:px-12 xl:px-20 pt-[calc(5.5rem+env(safe-area-inset-top,0px)+2rem)] lg:pt-16 pb-8 lg:pb-20 bg-[#FAFAFA] relative z-10">
          {/* Fondo punteado decorativo */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#154734 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <CheckoutHeader />

          <MobileCouponSection
            coupon={coupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            isPending={isPending}
          />

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

            <CheckoutSubmitButton isPending={isPending} total={total} />
          </div>
        </div>

        <OrderSummaryPanel
          items={items}
          subtotal={subtotal}
          shippingCost={shippingCost}
          shippingQuote={shippingQuote}
          total={total}
          coupon={coupon}
          couponDiscount={couponDiscount}
          lineItemDiscountPercentage={lineItemDiscountPercentage}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          isPending={isPending}
        />
      </form>
    </FormProvider>
  );
}
