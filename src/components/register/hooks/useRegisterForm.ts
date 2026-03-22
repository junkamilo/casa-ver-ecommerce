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

  const [step, setStep] = useState<"form" | "verify">("form");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Almacenados tras el registro exitoso para usarlos en la verificación
  const pendingUserId = useRef<string | null>(null);
  const pendingCredentials = useRef<{ email: string; password: string } | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // ─── Paso 1: Registro ────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || ERROR_MESSAGES.unexpected);
      }

      const responseData = await res.json();

      // Guardar datos necesarios para verificación y auto-login posterior
      pendingUserId.current = responseData.id;
      pendingCredentials.current = { email: data.email, password: data.password };
      setPendingEmail(data.email);

      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.unexpected);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Paso 2: Verificar código ────────────────────────────────────────────
  const onVerifyCode = async (code: string): Promise<void> => {
    if (!pendingUserId.current) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId.current, code }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Código incorrecto");
      }

      // Verificación exitosa → auto-login
      setSuccess(SUCCESS_MESSAGES.accountVerified);

      const creds = pendingCredentials.current!;
      const loginRes = await signIn("credentials", {
        email: creds.email,
        password: creds.password,
        redirect: false,
      });

      if (loginRes?.error) {
        // Verificado pero fallo el login: redirigir al login manualmente
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

  // ─── Reenviar código ─────────────────────────────────────────────────────
  const onResendCode = async (): Promise<void> => {
    if (!pendingUserId.current) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId.current }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "No se pudo reenviar el código");
      }

      setSuccess("Nuevo código enviado. Revisa tu correo.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.unexpected);
    }
  };

  // Limpia el estado de error cuando el usuario empieza a corregir el código
  const onCodeReset = (): void => {
    if (error) setError(null);
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
