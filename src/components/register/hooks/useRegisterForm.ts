"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerSchema, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";
import type { RegisterFormData, UseRegisterFormReturn } from "../types/types";

export function useRegisterForm(): UseRegisterFormReturn {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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

      setSuccess(SUCCESS_MESSAGES.accountCreated);

      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        throw new Error(ERROR_MESSAGES.loginAfterRegister);
      } else {
        router.refresh();
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.unexpected);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = (): void => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

  return {
    register,
    handleSubmit,
    errors,
    error,
    success,
    isLoading,
    onSubmit,
    handleGoogleLogin,
  };
}
