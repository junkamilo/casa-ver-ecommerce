import type { Order, OrderItem, User } from "@prisma/client";

// Forma exacta que retorna markOrderPaidUseCase: la orden actualizada con sus
// items y el usuario poblados. Es el shape que necesitan los notifiers de email
// (enqueueOrderConfirmationEmail) en los webhooks de Bold y Addi.
//
// Nota: `user` es non-nullable porque el campo Order.userId del schema Prisma
// no admite null (toda orden tiene siempre un usuario asociado, incluso los
// guests son creados como User en createOrder).
export type PaidOrderDTO = Order & {
  items: OrderItem[];
  user: User;
};

export type ReleaseOrderTargetStatus = "FAILED" | "REFUNDED" | "CANCELLED";
