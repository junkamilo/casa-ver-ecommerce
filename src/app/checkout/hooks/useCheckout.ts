"use client";

import { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/context/CartContext";
import { validateCoupon } from "@/app/actions/coupons";
import { createOrder } from "@/app/actions/checkout";
import { checkoutSchema } from "../types/schema";
import type { CheckoutFormData } from "../types/schema";
import type { CouponState } from "../types/types";

export type { CheckoutFormData };

// ---------------------------------------------------------------------------
// Opciones del hook
// ---------------------------------------------------------------------------
interface UseCheckoutOptions {
  /**
   * Callback ejecutado DESPUÉS de crear la orden pero ANTES de redirigir a Bold.
   * Úsalo para auto-guardar la dirección en el perfil del usuario.
   * Los errores en este callback se ignoran — nunca bloquean el pago.
   */
  onBeforePayment?: (data: CheckoutFormData) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook principal del checkout
// ---------------------------------------------------------------------------
export function useCheckout(options?: UseCheckoutOptions) {
  const { items, closeCart, buyNowItem, clearBuyNow } = useCart();

  // Si hay un buyNowItem el checkout opera solo con ese ítem (no toca el carrito)
  const checkoutItems = buyNowItem ? [buyNowItem] : items;
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cupón
  const [coupon, setCoupon] = useState<CouponState>({
    code: "",
    status: "idle",
    discountPercentage: 0,
  });

  // Cálculos derivados
  const discount =
    coupon.status === "valid"
      ? Math.round((subtotal * coupon.discountPercentage) / 100)
      : 0;
  const total = subtotal - discount;

  // Formulario
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormData>,
    defaultValues: {
      paymentMethod: "BOLD",
    },
  });

  // ---------------------------------------------------------------------------
  // Validar cupón
  // ---------------------------------------------------------------------------
  const handleApplyCoupon = useCallback(
    async (code: string) => {
      const email = form.getValues("email");

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.setError("email", {
          message: "Ingresa un correo válido antes de aplicar el cupón",
        });
        return;
      }

      setCoupon((prev) => ({ ...prev, code, status: "validating" }));

      const result = await validateCoupon(code, email);

      if (result.valid) {
        setCoupon({
          code,
          status: "valid",
          discountPercentage: result.discountPercentage!,
          couponId: result.couponId,
        });
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
  }, []);

  // ---------------------------------------------------------------------------
  // Submit: crear orden → crear link Bold → redirigir a checkout.bold.co
  // ---------------------------------------------------------------------------
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
        // PASO 1: Crear orden en DB (server action con validación completa)
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
          shippingCost: 0,
          discount,
          couponId: coupon.couponId,
          couponCode: coupon.status === "valid" ? coupon.code : undefined,
        });

        if (!orderResult.success || !orderResult.orderId) {
          setSubmitError(orderResult.error ?? "Error al procesar el pedido");
          return;
        }

        // PASO 1.5: Hook post-orden (ej. auto-guardar dirección) — fallo silencioso
        if (options?.onBeforePayment) {
          try {
            await options.onBeforePayment(data);
          } catch {
            // No bloqueamos el pago si falla el guardado
          }
        }

        // PASO 2: Crear payment link en Bold y redirigir al checkout
        const boldRes = await fetch("/api/payments/bold", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderResult.orderId,
            payer: {
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              phone: data.phone,
              cedula: data.cedula,
              address: data.address,
              addressDetail: data.addressDetail,
              city: data.city,
              department: data.department,
            },
          }),
        });

        const boldData = await boldRes.json();

        if (!boldRes.ok) {
          setSubmitError(boldData.error ?? "Error al conectar con Bold");
          return;
        }

        // Limpiar carrito antes de redirigir
        closeCart();
        clearBuyNow();

        // PASO 3: Redirigir a Bold hosted checkout
        if (boldData.redirectUrl) {
          window.location.href = boldData.redirectUrl;
          return;
        }

        setSubmitError("No se recibió URL de pago de Bold. Intenta de nuevo.");
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkoutItems, subtotal, discount, coupon, options, closeCart, clearBuyNow]
  );

  return {
    form,
    items: checkoutItems,
    subtotal,
    discount,
    total,
    coupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    isPending,
    submitError,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
