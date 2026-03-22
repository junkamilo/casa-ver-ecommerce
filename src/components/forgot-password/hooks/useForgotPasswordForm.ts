"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  recoveryEmailSchema,
  newPasswordSchema,
  ERROR_MESSAGES,
} from "../constants/constants";
import type {
  ForgotPasswordStep,
  RecoveryEmailFormData,
  NewPasswordFormData,
  UseForgotPasswordFormReturn,
} from "../types/types";

export function useForgotPasswordForm(): UseForgotPasswordFormReturn {
  const [step, setStep]       = useState<ForgotPasswordStep>("email");
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRecoveryEmail, setPendingRecoveryEmail] = useState("");

  const pendingUserId = useRef<string | null>(null);

  // ─── Formulario paso 1 ────────────────────────────────────────────────────
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm<RecoveryEmailFormData>({ resolver: zodResolver(recoveryEmailSchema) });

  // ─── Formulario paso 3 ────────────────────────────────────────────────────
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
  } = useForm<NewPasswordFormData>({ resolver: zodResolver(newPasswordSchema) });

  // ─── Paso 1: Solicitar código ─────────────────────────────────────────────
  const onSubmitEmail = async (data: RecoveryEmailFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryEmail: data.recoveryEmail }),
      });

      const json = await res.json();

      if (res.status === 429) {
        setError(json.message);
        return;
      }

      // Sea 200 o 404 mostramos lo mismo (seguridad: no revelar si existe)
      // Si el backend devolvió userId, avanzamos al paso de verificación
      if (json.userId) {
        pendingUserId.current = json.userId;
        setPendingRecoveryEmail(data.recoveryEmail);
        setStep("verify");
      } else {
        // recoveryEmail no encontrado: mostramos mensaje genérico igualmente
        setSuccess(ERROR_MESSAGES.notFound);
      }
    } catch {
      setError(ERROR_MESSAGES.generic);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Paso 2: Verificar código OTP ────────────────────────────────────────
  const onVerifyCode = async (code: string): Promise<void> => {
    if (!pendingUserId.current) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId.current, code }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Código incorrecto");
      }

      setStep("new-pass");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.generic);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Reenviar código ──────────────────────────────────────────────────────
  const onResendCode = async (): Promise<void> => {
    if (!pendingRecoveryEmail) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryEmail: pendingRecoveryEmail }),
      });

      const json = await res.json();

      if (res.status === 429) {
        throw new Error(json.message);
      }

      if (json.userId) {
        pendingUserId.current = json.userId;
        setSuccess("Nuevo código enviado. Revisa tu correo.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.generic);
    }
  };

  const onCodeReset = (): void => {
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // ─── Paso 3: Nueva contraseña ─────────────────────────────────────────────
  const onSubmitNewPassword = async (data: NewPasswordFormData): Promise<void> => {
    if (!pendingUserId.current) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId.current, password: data.password }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || ERROR_MESSAGES.generic);
      }

      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.generic);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    error,
    success,
    isLoading,
    pendingRecoveryEmail,
    registerEmail,
    handleSubmitEmail,
    errorsEmail,
    onSubmitEmail,
    onVerifyCode,
    onResendCode,
    onCodeReset,
    registerPassword,
    handleSubmitPassword,
    errorsPassword,
    onSubmitNewPassword,
  };
}
