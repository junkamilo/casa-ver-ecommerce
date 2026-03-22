import { Suspense } from "react";
import VerificarEmailClient from "./VerificarEmailClient";

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerificarEmailClient />
    </Suspense>
  );
}

function VerifyLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#154734] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Verificando...</p>
      </div>
    </div>
  );
}
