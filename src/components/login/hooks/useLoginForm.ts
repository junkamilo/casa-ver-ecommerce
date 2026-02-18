"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema, ERROR_MESSAGES } from "../constants/constants";
import type { LoginFormData, UseLoginFormReturn } from "../types/types";

export function useLoginForm(): UseLoginFormReturn {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(ERROR_MESSAGES.invalidCredentials);
        setIsLoading(false);
      } else {
        router.refresh();
        router.push("/");
      }
    } catch {
      setError(ERROR_MESSAGES.unexpected);
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
    isLoading,
    onSubmit,
    handleGoogleLogin,
  };
}
