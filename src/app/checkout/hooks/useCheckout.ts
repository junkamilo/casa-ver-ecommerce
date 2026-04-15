"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/context/CartContext";
import { validateCoupon } from "@/app/actions/coupons";
import { createOrder } from "@/app/actions/checkout";
import { checkEarlyBirdStatus } from "@/app/actions/earlybird";
import { EARLY_BIRD_DISCOUNT_PCT } from "@/lib/earlybird.constants";
import { getShippingCost } from "@/lib/shipping";
import { checkoutSchema } from "../types/schema";
import type { CheckoutFormData } from "../types/schema";
import type { CouponState } from "../types";

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

  // Early Bird
  const [earlyBird, setEarlyBird] = useState<{ hasDiscount: boolean; checked: boolean }>({
    hasDiscount: false,
    checked: false,
  });
  const lastCheckedEmail = useRef<string>("");

  // Cupón
  const [coupon, setCoupon] = useState<CouponState>({
    code: "",
    status: "idle",
    discountPercentage: 0,
  });

  // Formulario
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormData>,
    defaultValues: {
      paymentMethod: "BOLD",
    },
  });

  // Costo de envío reactivo — se recalcula cuando el usuario elige ciudad/departamento
  const cityValue = form.watch("city");
  const departmentValue = form.watch("department");
  const shippingCost =
    cityValue && departmentValue ? getShippingCost(cityValue, departmentValue) : 0;

  // Cálculos derivados
  const earlyBirdDiscount = earlyBird.hasDiscount
    ? Math.round((subtotal * EARLY_BIRD_DISCOUNT_PCT) / 100)
    : 0;
  const couponDiscount =
    coupon.status === "valid"
      ? Math.round((subtotal * coupon.discountPercentage) / 100)
      : 0;
  const discount = couponDiscount + earlyBirdDiscount;
  const total = subtotal + shippingCost - discount;

  // ---------------------------------------------------------------------------
  // Verificar estado Early Bird cuando el email cambia (debounce 800ms)
  // ---------------------------------------------------------------------------
  const emailValue = form.watch("email");

  useEffect(() => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEarlyBird({ hasDiscount: false, checked: false });
      lastCheckedEmail.current = "";
      return;
    }
    if (emailValue === lastCheckedEmail.current) return;

    const timer = setTimeout(async () => {
      lastCheckedEmail.current = emailValue;
      const status = await checkEarlyBirdStatus(emailValue);
      setEarlyBird({ hasDiscount: status.hasDiscount, checked: true });
    }, 800);

    return () => clearTimeout(timer);
  }, [emailValue]);

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
          shippingCost,
          discount: couponDiscount, // El servidor re-calcula el early bird; aquí solo va el cupón
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

        // PASO 2: Crear link de pago según método seleccionado y redirigir
        if (data.paymentMethod === "ADDI") {
          // ── Addi ──────────────────────────────────────────────────────────
          const addiRes = await fetch("/api/payments/addi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderResult.orderId,
              cedula: data.cedula, // único dato personal que no está en la BD
            }),
          });

          const addiData = await addiRes.json();

          if (!addiRes.ok) {
            setSubmitError(addiData.error ?? "Error al conectar con Addi");
            return;
          }

          closeCart();
          clearBuyNow();

          if (addiData.redirectUrl) {
            window.location.href = addiData.redirectUrl;
            return;
          }

          setSubmitError("No se recibió URL de Addi. Intenta de nuevo.");
        } else {
          // ── Bold ───────────────────────────────────────────────────────────
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
          clearBuyNow();

          if (boldData.redirectUrl) {
            window.location.href = boldData.redirectUrl;
            return;
          }

          setSubmitError("No se recibió URL de pago de Bold. Intenta de nuevo.");
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkoutItems, subtotal, shippingCost, couponDiscount, coupon, options, closeCart, clearBuyNow]
  );

  return {
    form,
    items: checkoutItems,
    subtotal,
    shippingCost,
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
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
