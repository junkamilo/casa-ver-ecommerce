import { Suspense } from "react";
import BoldPaymentClient from "./BoldPaymentClient";

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
