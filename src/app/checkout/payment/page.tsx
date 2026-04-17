import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BoldPaymentClient from "./components/BoldPaymentClient";

interface PageProps {
  searchParams: Promise<{
    ref?: string;
    amount?: string;
    integrity?: string;
    orderId?: string;
  }>;
}

export default async function BoldPaymentPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Guard: si la orden ya fue pagada (webhook llegó antes que el usuario),
  // redirigir directamente a success sin mostrar el botón de Bold de nuevo.
  if (params.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      select: { id: true, status: true },
    });
    if (order?.status === "PAID") {
      redirect(`/checkout/success?orderId=${order.id}`);
    }
  }

  return (
    <Suspense>
      <BoldPaymentClient
        orderRef={params.ref ?? ""}
        amount={params.amount ?? ""}
        integrity={params.integrity ?? ""}
        orderId={params.orderId ?? ""}
      />
    </Suspense>
  );
}
