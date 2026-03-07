"use client";

import { FormProvider } from "react-hook-form";
import { useCheckout } from "./hooks/useCheckout";
import CheckoutMobileSummary from "./components/CheckoutMobileSummary";
import CheckoutHeader from "./components/CheckoutHeader";
import ContactSection from "./components/ContactSection";
import DeliverySection from "./components/DeliverySection";
import ShippingMethodSection from "./components/ShippingMethodSection";
import PaymentSection from "./components/PaymentSection";
import BillingSection from "./components/BillingSection";
import CheckoutSubmitButton from "./components/CheckoutSubmitButton";
import CheckoutFooterLinks from "./components/CheckoutFooterLinks";
import OrderSummaryPanel from "./components/OrderSummaryPanel";

export default function CheckoutPage() {
  const {
    form,
    items,
    subtotal,
    shippingCost,
    discount,
    total,
    coupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    isPending,
    submitError,
    onSubmit,
    billingSameAsShipping,
    setBillingSameAsShipping,
  } = useCheckout();

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className="min-h-screen bg-[#FAFAFA] flex flex-col lg:flex-row font-sans selection:bg-[#C19A6B]/20 relative overflow-hidden"
      >
        <CheckoutMobileSummary
          items={items}
          subtotal={subtotal}
          shippingCost={shippingCost}
          discount={discount}
          total={total}
        />

        <div className="flex-1 lg:w-[55%] flex flex-col px-4 sm:px-8 lg:px-12 xl:px-20 pt-8 lg:pt-16 pb-20 bg-[#FAFAFA] relative z-10">
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
            <DeliverySection />
            <ShippingMethodSection shippingCost={shippingCost} />
            <PaymentSection />
            <BillingSection
              billingSameAsShipping={billingSameAsShipping}
              onChange={setBillingSameAsShipping}
            />

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
          shippingCost={shippingCost}
          discount={discount}
          total={total}
          coupon={coupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />
      </form>
    </FormProvider>
  );
}
