import type { z } from "zod";
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import type { recoveryEmailSchema, newPasswordSchema } from "../constants";

export type RecoveryEmailFormData = z.infer<typeof recoveryEmailSchema>;
export type NewPasswordFormData   = z.infer<typeof newPasswordSchema>;

export type ForgotPasswordStep = "email" | "verify" | "new-pass" | "success";

export interface UseForgotPasswordFormReturn {
  step: ForgotPasswordStep;
  error: string | null;
  success: string | null;
  isLoading: boolean;
  pendingRecoveryEmail: string;

  // Paso 1
  registerEmail: UseFormRegister<RecoveryEmailFormData>;
  handleSubmitEmail: UseFormHandleSubmit<RecoveryEmailFormData>;
  errorsEmail: FieldErrors<RecoveryEmailFormData>;
  onSubmitEmail: (data: RecoveryEmailFormData) => Promise<void>;

  // Paso 2
  onVerifyCode: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  onCodeReset: () => void;

  // Paso 3
  registerPassword: UseFormRegister<NewPasswordFormData>;
  handleSubmitPassword: UseFormHandleSubmit<NewPasswordFormData>;
  errorsPassword: FieldErrors<NewPasswordFormData>;
  onSubmitNewPassword: (data: NewPasswordFormData) => Promise<void>;
}

export interface RecoveryEmailStepProps {
  register:     UseFormRegister<RecoveryEmailFormData>;
  handleSubmit: UseFormHandleSubmit<RecoveryEmailFormData>;
  errors:       FieldErrors<RecoveryEmailFormData>;
  error:        string | null;
  success:      string | null;
  isLoading:    boolean;
  onSubmit:     (data: RecoveryEmailFormData) => Promise<void>;
}

export interface NewPasswordStepProps {
  register:     UseFormRegister<NewPasswordFormData>;
  handleSubmit: UseFormHandleSubmit<NewPasswordFormData>;
  errors:       FieldErrors<NewPasswordFormData>;
  error:        string | null;
  isLoading:    boolean;
  onSubmit:     (data: NewPasswordFormData) => Promise<void>;
}
