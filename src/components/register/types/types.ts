import type { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  recoveryEmail?: string;
  phone?: string;
}

export interface UseRegisterFormReturn {
  register: UseFormRegister<RegisterFormData>;
  handleSubmit: UseFormHandleSubmit<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  setValue: UseFormSetValue<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
  error: string | null;
  success: string | null;
  isLoading: boolean;
  onSubmit: (data: RegisterFormData) => Promise<void>;
  handleGoogleLogin: () => void;
  // Verificación por código
  step: "form" | "verify";
  pendingEmail: string;
  onVerifyCode: (code: string) => void;
  onResendCode: () => Promise<void>;
  onCodeReset: () => void;
}
