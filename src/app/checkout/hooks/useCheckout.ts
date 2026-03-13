"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------
export function useCheckout() {
  const router = useRouter();
  const { items, subtotal, closeCart } = useCart();
  const [isPending, startTransition] = useTransition();

  // Cupón
  const [coupon, setCoupon] = useState<CouponState>({
    code: "",
    status: "idle",
    discountPercentage: 0,
  });

  // Error global del submit
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cálculos
  const discount = coupon.status === "valid"
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

    if (!email || !form.formState.dirtyFields.email) {
      form.setError("email", { message: "Ingresa tu correo antes de aplicar el cupón" });
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
  // Submit — crear orden
  // ---------------------------------------------------------------------------
  function onSubmit(data: CheckoutFormData) {
    if (!items.length) {
      setSubmitError("Tu carrito está vacío");
      return;
    }

    setSubmitError(null);

    startTransition(async () => {
      const result = await createOrder({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        cedula: data.cedula,
        phone: data.phone,
        address: data.address,
        addressDetail: data.addressDetail,
        city: data.city,
        department: data.department,
        paymentMethod: data.paymentMethod,
        items: items.map((item) => ({
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

      if (!result.success) {
        setSubmitError(result.error ?? "Error al procesar el pedido");
        return;
      }

      closeCart();

      if (result.redirectUrl) {
        // MP init_point es URL externa → window.location para salir del SPA
        if (result.redirectUrl.startsWith("http")) {
          window.location.href = result.redirectUrl;
        } else {
          router.push(result.redirectUrl);
        }
      }
    });
  }

  return {
    form,
    items,
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
    // Atajos para los componentes
    billingSameAsShipping: form.watch("billingSameAsShipping"),
    setBillingSameAsShipping: (val: boolean) => form.setValue("billingSameAsShipping", val),
  };
}
