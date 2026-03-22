"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "success" | "error";

export default function VerificarEmailClient() {
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("El enlace de verificación no es válido.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.message || "No se pudo verificar el correo.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión. Intenta de nuevo.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Leaf className="w-6 h-6 text-[#154734]" />
        <span
          className="text-2xl font-bold text-[#154734]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Casa Verde
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-[#154734] animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Verificando tu correo...
            </h1>
            <p className="text-sm text-gray-500">Un momento, por favor.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              ¡Correo verificado!
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-[#154734] text-white text-sm font-semibold rounded-lg hover:bg-[#0f3526] transition-colors"
            >
              Iniciar sesión
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Enlace inválido o expirado
            </h1>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link
              href="/registro"
              className="inline-block w-full py-3 bg-[#154734] text-white text-sm font-semibold rounded-lg hover:bg-[#0f3526] transition-colors"
            >
              Volver a registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
