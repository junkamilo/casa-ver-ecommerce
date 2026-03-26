"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/context/CartContext";
import { validateCoupon } from "@/app/actions/coupons";
import { createOrder } from "@/app/actions/checkout";
import { SHIPPING_COST } from "../constants/constants";
import type { CouponState } from "../types/types";

// ---------------------------------------------------------------------------
// Schema Zod — exportado para inferir CheckoutFormData en types.ts
// ---------------------------------------------------------------------------
export const checkoutSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  cedula: z
    .string()
    .min(6, "Cédula inválida")
    .regex(/^\d+$/, "Solo números"),
  phone: z
    .string()
    .min(10, "Teléfono inválido")
    .regex(/^\d+$/, "Solo números"),
  address: z.string().min(5, "Dirección muy corta"),
  addressDetail: z.string().optional(),
  city: z.string().min(2, "Ciudad requerida"),
  department: z.string().min(2, "Departamento requerido"),
  paymentMethod: z.enum(["BOLD"]),
  billingSameAsShipping: z.boolean(),
  couponCode: z.string().optional(),
  savedAddressId: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------
export function useCheckout() {
  const { items, closeCart, buyNowItem, clearBuyNow } = useCart();

  // Si hay un buyNowItem, el checkout opera solo con ese ítem (no toca el carrito)
  const checkoutItems = buyNowItem ? [buyNowItem] : items;
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [isPending, startTransition] = useTransition();

  // Cupón
  const [coupon, setCoupon] = useState<CouponState>({
    code: "",
    status: "idle",
    discountPercentage: 0,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cálculos
  const discount =
    coupon.status === "valid"
      ? Math.round((subtotal * coupon.discountPercentage) / 100)
      : 0;
  const total = subtotal + SHIPPING_COST - discount;

  // Form
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "BOLD",
      billingSameAsShipping: true,
    },
  });

  // ---------------------------------------------------------------------------
  // Validar cupón
  // ---------------------------------------------------------------------------
  async function handleApplyCoupon(code: string) {
    const email = form.getValues("email");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.setError("email", { message: "Ingresa un correo válido antes de aplicar el cupón" });
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
  }

  function handleRemoveCoupon() {
    setCoupon({ code: "", status: "idle", discountPercentage: 0 });
  }

  // ---------------------------------------------------------------------------
  // Submit — crear orden → crear link Bold → redirigir directo a checkout.bold.co
  // ---------------------------------------------------------------------------
  function onSubmit(data: CheckoutFormData) {
    if (!checkoutItems.length) {
      setSubmitError("No hay productos para procesar. Vuelve a la tienda y selecciona un producto.");
      return;
    }

    setSubmitError(null);

    startTransition(async () => {
      // PASO 1: Crear orden en DB
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
        shippingCost: SHIPPING_COST,
        discount,
        couponId: coupon.couponId,
        couponCode: coupon.status === "valid" ? coupon.code : undefined,
      });

      if (!orderResult.success || !orderResult.orderId) {
        setSubmitError(orderResult.error ?? "Error al procesar el pedido");
        return;
      }

      // PASO 2: Crear link de pago en Bold y obtener URL de redirección
      console.log("[BOLD] Creando link de pago para orden:", orderResult.orderId);

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
          },
        }),
      });

      const boldData = await boldRes.json();
      console.log("[BOLD] Respuesta:", boldData);

      if (!boldRes.ok) {
        setSubmitError(boldData.error ?? "Error al conectar con Bold");
        return;
      }

      closeCart();
      clearBuyNow();

      // PASO 3: Redirigir DIRECTAMENTE a Bold
      if (boldData.redirectUrl) {
        console.log("[BOLD] Redirigiendo a:", boldData.redirectUrl);
        window.location.href = boldData.redirectUrl;
        return;
      }

      console.warn("[BOLD] Sin redirectUrl en la respuesta:", boldData);
      setSubmitError("No se recibió URL de pago de Bold. Intenta de nuevo.");
    });
  }

  return {
    form,
    items: checkoutItems,
    subtotal,
    shippingCost: SHIPPING_COST,
    discount,
    total,
    coupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    isPending,
    submitError,
    onSubmit: form.handleSubmit(onSubmit),
    billingSameAsShipping: form.watch("billingSameAsShipping"),
    setBillingSameAsShipping: (val: boolean) =>
      form.setValue("billingSameAsShipping", val),
  };
}
