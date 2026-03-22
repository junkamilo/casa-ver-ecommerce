"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import OTPInput from "./OTPInput";

interface VerifyCodeStepProps {
  email: string;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  onVerifyCode: (code: string) => void;
  onResendCode: () => Promise<void>;
  onCodeReset: () => void;
}

const RESEND_COOLDOWN = 60;

export default function VerifyCodeStep({
  email,
  isLoading,
  error,
  success,
  onVerifyCode,
  onResendCode,
  onCodeReset,
}: VerifyCodeStepProps) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  // Countdown para el botón de reenviar
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setResending(true);
    await onResendCode();
    setCooldown(RESEND_COOLDOWN);
    setResending(false);
  };

  // Enmascarar el email: j***@gmail.com
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, _b, c) => {
    return `${a}${"*".repeat(4)}${c}`;
  });

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Encabezado */}
      <div className="mb-7 text-center">
        <div className="w-16 h-16 rounded-full bg-[#154734]/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-[#154734]" />
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold text-[#154734] mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Verifica tu correo
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Enviamos un código de 6 dígitos a{" "}
          <span className="font-semibold text-gray-700">{maskedEmail}</span>
          <br />
          Ingrésalo aquí para activar tu cuenta.
        </p>
      </div>

      {/* Error */}
      {error && !success && (
        <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-2 rounded text-xs sm:text-sm animate-in fade-in">
          <span className="mt-0.5 shrink-0">⚠</span>
          <p>{error}</p>
        </div>
      )}

      {/* Éxito */}
      {success && (
        <div className="mb-5 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center gap-2 rounded text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* OTP Input */}
      <div className="mb-6">
        <OTPInput
          onComplete={onVerifyCode}
          disabled={isLoading}
          hasError={!!error}
          onReset={onCodeReset}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-center text-sm text-[#154734] mb-4 animate-pulse">
          Verificando código...
        </p>
      )}

      {/* Separador */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">¿No recibiste el código?</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Botón reenviar */}
      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || resending || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-gray-200 text-sm font-medium text-gray-600 hover:border-[#154734] hover:text-[#154734] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600"
      >
        <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
        {resending
          ? "Enviando..."
          : cooldown > 0
          ? `Reenviar en ${cooldown}s`
          : "Reenviar código"}
      </button>

      <p className="mt-5 text-center text-xs text-gray-400">
        Revisa también tu carpeta de spam o correo no deseado.
      </p>
    </div>
  );
}
