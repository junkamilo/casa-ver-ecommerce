"use server";

import { createOrderUseCase } from "@/modules/checkout/application/create-order.use-case";
import { markOrderPaidUseCase } from "@/modules/orders/application/mark-order-paid.use-case";
import { releaseOrderStockUseCase } from "@/modules/orders/application/release-order-stock.use-case";
import { getShippingCost } from "@/modules/shipping/application/use-cases/get-shipping-cost.use-case";
import { getShippingConfigFromDb } from "@/modules/shipping/infrastructure/prisma-shipping-config.repository";
import { prisma } from "@/lib/prisma";
import { normalizeString } from "@/modules/geography/domain/normalize-string";

// ---------------------------------------------------------------------------
// Tipos públicos del Server Action — preservados byte-a-byte para que
// `useCheckout` y cualquier otro consumidor sigan funcionando sin cambios.
// ---------------------------------------------------------------------------

export interface CreateOrderInput {
  email: string;
  firstName: string;
  lastName: string;
  cedula: string;
  phone: string;

  address: string;
  addressDetail?: string;
  city: string;
  department: string;
  /** Si el usuario eligió una dirección guardada, se vincula a la orden */
  savedAddressId?: string;

  paymentMethod: "BOLD" | "ADDI";

  items: {
    variantId: string;
    productId: string;
    name: string;
    sku: string;
    colorName: string;
    size: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];

  subtotal: number;
  shippingCost: number;
  discount: number;

  couponId?: string;
  couponCode?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  transactionId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// createOrder — Server Action wrapper.
//
// Delega en createOrderUseCase del módulo modules/checkout. Se mantiene aquí
// solo como punto de entrada Server Action para retro-compatibilidad con
// useCheckout y cualquier otro consumidor existente.
// ---------------------------------------------------------------------------
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  return createOrderUseCase(input);
}

// ---------------------------------------------------------------------------
// releaseOrderStock — Server Action wrapper.
//
// Delega en releaseOrderStockUseCase del módulo modules/orders. Se mantiene
// aquí solo como punto de entrada Server Action para retro-compatibilidad
// con los webhooks de Bold/Addi y otros consumidores existentes.
// ---------------------------------------------------------------------------
export async function releaseOrderStock(
  transactionId: string,
  newStatus: "FAILED" | "REFUNDED" | "CANCELLED",
): Promise<void> {
  return releaseOrderStockUseCase(transactionId, newStatus);
}

// ---------------------------------------------------------------------------
// markOrderPaid — Server Action wrapper.
//
// Delega en markOrderPaidUseCase del módulo modules/orders. Se mantiene
// aquí solo como punto de entrada Server Action para retro-compatibilidad
// con los webhooks de Bold/Addi y otros consumidores existentes.
// ---------------------------------------------------------------------------
export async function markOrderPaid(transactionId: string, paymentId: string) {
  return markOrderPaidUseCase(transactionId, paymentId);
}

export async function getShippingCostAction(input: {
  cityName?: string;
  departmentName?: string;
  subtotalNeto: number;
}) {
  const config = await getShippingConfigFromDb();
  const freeShippingThreshold = config?.freeShippingThreshold ?? 0;
  const qualifiesForFreeShipping = input.subtotalNeto >= freeShippingThreshold;

  if (!input.cityName || !input.departmentName) {
    return {
      cost: 0,
      baseCost: null,
      isFreeByThreshold: qualifiesForFreeShipping,
      isPendingAddress: true,
      freeShippingThreshold,
    };
  }

  const municipality = await prisma.municipality.findFirst({
    where: {
      normalizedName: normalizeString(input.cityName),
      department: { name: input.departmentName },
    },
  });

  if (!municipality) {
    return {
      cost: 0,
      baseCost: null,
      isFreeByThreshold: qualifiesForFreeShipping,
      isPendingAddress: true,
      freeShippingThreshold,
    };
  }

  const quote = await getShippingCost({
    municipalityId: municipality.id,
    subtotalNeto: input.subtotalNeto,
  });

  if (!quote.ok) {
    return {
      cost: 0,
      baseCost: null,
      isFreeByThreshold: qualifiesForFreeShipping,
      isPendingAddress: true,
      freeShippingThreshold,
    };
  }

  return {
    cost: quote.cost,
    baseCost: quote.baseCost,
    isFreeByThreshold: quote.isFreeByThreshold,
    isPendingAddress: false,
    freeShippingThreshold: quote.freeShippingThreshold,
  };
}
