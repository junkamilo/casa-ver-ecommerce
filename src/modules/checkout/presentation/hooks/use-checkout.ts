"use client";

import { useState, useTransition, useCallback, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCart,
  CHECKOUT_MODE_KEY,
  CHECKOUT_MODE_BUY_NOW,
} from "@/context/CartContext";
import { validateCoupon } from "@/app/actions/coupons";
import { createOrder } from "@/app/actions/checkout";
import { resolveShippingQuote } from "@/lib/shipping";
import { calculateCouponDiscountAmount } from "@/modules/checkout/domain/coupon.entity";
import { checkoutSchema } from "@/app/checkout/types/schema";
import type { CheckoutFormData } from "@/app/checkout/types/schema";
import type { CouponState } from "@/app/checkout/types";

export type { CheckoutFormData };

interface UseCheckoutOptions {
  onBeforePayment?: (data: CheckoutFormData) => Promise<void>;
}

export function useCheckout(options?: UseCheckoutOptions) {
  const { items, closeCart, clearCart, buyNowItem, clearBuyNow } = useCart();
  const [preferBuyNow, setPreferBuyNow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CHECKOUT_MODE_KEY) === CHECKOUT_MODE_BUY_NOW) {
        setPreferBuyNow(true);
        sessionStorage.removeItem(CHECKOUT_MODE_KEY);
      }
    } catch {
      // sessionStorage no disponible
    }
  }, []);

  // Limpia buy-now obsoleto en localStorage cuando el carrito tiene productos.
  useEffect(() => {
    if (!preferBuyNow && items.length > 0 && buyNowItem) {
      clearBuyNow();
    }
  }, [preferBuyNow, items.length, buyNowItem, clearBuyNow]);

  const checkoutItems = useMemo(
    () =>
      preferBuyNow && buyNowItem
        ? [buyNowItem]
        : items.length > 0
          ? items
          : buyNowItem
            ? [buyNowItem]
            : [],
    [preferBuyNow, buyNowItem, items]
  );

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [coupon, setCoupon] = useState<CouponState>({
    code: "",
    status: "idle",
    discountPercentage: 0,
  });
  const [showCouponCelebration, setShowCouponCelebration] = useState(false);
  const [showFreeShippingCelebration, setShowFreeShippingCelebration] = useState(false);
  const freeShippingModalShownRef = useRef(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormData>,
    defaultValues: {
      paymentMethod: "BOLD",
    },
  });

  const cityValue = form.watch("city");
  const departmentValue = form.watch("department");

  const couponDiscount =
    coupon.status === "valid"
      ? calculateCouponDiscountAmount(
          subtotal,
          coupon.discountType ?? "PERCENTAGE",
          coupon.discountType === "FIXED"
            ? (coupon.discountValue ?? 0)
            : coupon.discountPercentage
        )
      : 0;

  const netSubtotal = subtotal - couponDiscount;
  const shippingQuote = resolveShippingQuote({
    netSubtotal,
    city: cityValue,
    department: departmentValue,
  });
  const shippingCost = shippingQuote.cost;

  // Modal de celebración al entrar a checkout con envío gratis (una vez por visita).
  useEffect(() => {
    if (
      freeShippingModalShownRef.current ||
      checkoutItems.length === 0 ||
      !shippingQuote.isFreeByThreshold
    ) {
      return;
    }
    freeShippingModalShownRef.current = true;
    setShowFreeShippingCelebration(true);
  }, [checkoutItems.length, shippingQuote.isFreeByThreshold]);

  const lineItemDiscountPercentage =
    coupon.status === "valid"
      ? coupon.discountType === "FIXED" && subtotal > 0
        ? Math.round((couponDiscount / subtotal) * 100)
        : coupon.discountPercentage
      : 0;
  const discount = couponDiscount;
  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = useCallback(
    async (code: string) => {
      const email = form.getValues("email")?.trim();
      const hasValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      setCoupon((prev) => ({ ...prev, code, status: "validating" }));

      const result = await validateCoupon(code, hasValidEmail ? email : undefined);

      if (
        !result.valid &&
        result.error === "Correo requerido para validar este cupón"
      ) {
        form.setError("email", {
          message: "Ingresa un correo válido antes de aplicar este cupón",
        });
        setCoupon({
          code,
          status: "invalid",
          discountPercentage: 0,
          errorMessage: result.error,
        });
        return;
      }

      if (result.valid) {
        const discountType = result.discountType ?? "PERCENTAGE";
        const discountValue = result.discountValue ?? result.discountPercentage ?? 0;
        setCoupon({
          code,
          status: "valid",
          discountType,
          discountValue,
          discountPercentage:
            discountType === "PERCENTAGE" ? discountValue : 0,
          couponId: result.couponId,
        });
        setShowCouponCelebration(true);
      } else {
        setCoupon({
          code,
          status: "invalid",
          discountPercentage: 0,
          errorMessage: result.error,
        });
      }
    },
    [form]
  );

  const handleRemoveCoupon = useCallback(() => {
    setCoupon({ code: "", status: "idle", discountPercentage: 0 });
    setShowCouponCelebration(false);
  }, []);

  const dismissCouponCelebration = useCallback(() => {
    setShowCouponCelebration(false);
  }, []);

  const dismissFreeShippingCelebration = useCallback(() => {
    setShowFreeShippingCelebration(false);
  }, []);

  const handleSubmit = useCallback(
    (data: CheckoutFormData) => {
      if (!checkoutItems.length) {
        setSubmitError(
          "No hay productos para procesar. Vuelve a la tienda y selecciona un producto."
        );
        return;
      }

      setSubmitError(null);

      startTransition(async () => {
        const orderResult = await createOrder({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          cedula: data.cedula,
          phone: data.phone,
          address: data.address,
          addressDetail: data.addressDetail,
          city: data.city,
          department: data.department,
          savedAddressId: data.savedAddressId,
          paymentMethod: data.paymentMethod,
          items: checkoutItems.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            colorName: item.color,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            imageUrl: typeof item.image === "string" ? item.image : undefined,
          })),
          subtotal,
          shippingCost,
          discount: couponDiscount,
          couponId: coupon.couponId,
          couponCode: coupon.status === "valid" ? coupon.code : undefined,
        });

        if (!orderResult.success || !orderResult.orderId) {
          setSubmitError(orderResult.error ?? "Error al procesar el pedido");
          return;
        }

        if (options?.onBeforePayment) {
          try {
            await options.onBeforePayment(data);
          } catch {
            // No bloqueamos el pago si falla el guardado
          }
        }

        if (data.paymentMethod === "ADDI") {
          const addiAbort = new AbortController();
          const addiAbortTimer = setTimeout(() => addiAbort.abort(), 20_000);

          let addiRes: Response;
          try {
            addiRes = await fetch("/api/payments/addi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderResult.orderId,
                cedula: data.cedula,
              }),
              signal: addiAbort.signal,
            });
          } catch {
            clearTimeout(addiAbortTimer);
            setSubmitError(
              "El servicio de Addi no responde. Por favor elige otro método de pago."
            );
            return;
          } finally {
            clearTimeout(addiAbortTimer);
          }

          const addiData = await addiRes.json();

          if (!addiRes.ok) {
            setSubmitError(addiData.error ?? "Error al conectar con Addi");
            return;
          }

          closeCart();
          clearCart();
          clearBuyNow();

          if (addiData.redirectUrl) {
            window.location.href = addiData.redirectUrl;
            return;
          }

          setSubmitError("No se recibió URL de Addi. Intenta de nuevo.");
        } else {
          const boldRes = await fetch("/api/payments/bold", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: orderResult.orderId }),
          });

          const boldData = await boldRes.json();

          if (!boldRes.ok) {
            setSubmitError(boldData.error ?? "Error al conectar con Bold");
            return;
          }

          closeCart();
          clearCart();
          clearBuyNow();

          if (boldData.redirectUrl) {
            if (orderResult.transactionId) {
              sessionStorage.setItem("bold_pending_reference_id", orderResult.transactionId);
            }
            window.location.href = boldData.redirectUrl;
            return;
          }

          setSubmitError("No se recibió URL de pago de Bold. Intenta de nuevo.");
        }
      });
    },
    [checkoutItems, subtotal, shippingCost, couponDiscount, coupon, options, closeCart, clearCart, clearBuyNow]
  );

  return {
    form,
    items: checkoutItems,
    subtotal,
    netSubtotal,
    shippingCost,
    shippingQuote,
    discount,
    couponDiscount,
    total,
    coupon,
    lineItemDiscountPercentage,
    handleApplyCoupon,
    handleRemoveCoupon,
    showCouponCelebration,
    dismissCouponCelebration,
    showFreeShippingCelebration,
    dismissFreeShippingCelebration,
    isPending,
    submitError,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
