import { Suspense } from "react";
import { ResultContent } from "./components/ResultContent";

export default function PagoResultadoPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
