"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerSchema, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type { RegisterFormData, UseRegisterFormReturn } from "../types/types";

export function useRegisterForm(): UseRegisterFormReturn {
  const router = useRouter();

  const [step, setStep]       = useState<"form" | "verify">("form");
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // tokenId del EmailVerificationToken (opaco, nunca expone userId)
  const pendingTokenId    = useRef<string | null>(null);
  // Credenciales para auto-login tras verificación exitosa
  const pendingCredentials = useRef<{ email: string; password: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  // ─── Paso 1: Registro ─────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message ?? ERROR_MESSAGES.unexpected);
      }

      pendingTokenId.current    = responseData.tokenId;
      pendingCredentials.current = { email: data.email, password: data.password };
      setPendingEmail(data.email);
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.unexpected);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Paso 2: Verificar código ─────────────────────────────────────────────
  const onVerifyCode = async (code: string): Promise<void> => {
    if (!pendingTokenId.current) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tokenId: pendingTokenId.current, code }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message ?? "Código incorrecto");
      }

      setSuccess(SUCCESS_MESSAGES.accountVerified);

      const creds = pendingCredentials.current;
      if (!creds) {
        router.push("/login?verified=true");
        return;
      }

      const loginRes = await signIn("credentials", {
        email:    creds.email,
        password: creds.password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login?verified=true");
      } else {
        router.refresh();
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.unexpected);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Reenviar código ──────────────────────────────────────────────────────
  const onResendCode = async (): Promise<void> => {
    if (!pendingTokenId.current) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tokenId: pendingTokenId.current }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message ?? "No se pudo reenviar el código");
      }

      // El servidor puede devolver un nuevo tokenId si se regeneró
      if (responseData.tokenId) {
        pendingTokenId.current = responseData.tokenId;
      }

      setSuccess("Nuevo código enviado. Revisa tu correo.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.unexpected);
    }
  };

  const onCodeReset = (): void => {
    if (error)   setError(null);
    if (success) setSuccess(null);
  };

  const handleGoogleLogin = (): void => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    error,
    success,
    isLoading,
    onSubmit,
    handleGoogleLogin,
    step,
    pendingEmail,
    onVerifyCode,
    onResendCode,
    onCodeReset,
  };
}
