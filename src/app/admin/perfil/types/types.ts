import type { Dispatch, SetStateAction, FormEvent } from "react";
import type { AdminProfileUiModel } from "@/modules/adminCatalog/profile/presentation/mappers";

// ─── Entidades de Dominio ────────────────────────────────────────────────────

export type UserProfile = AdminProfileUiModel;

export type ToastState = { type: "success" | "error"; message: string } | null;

// ─── Tipos Compartidos ───────────────────────────────────────────────────────

/** Función para mostrar notificaciones toast */
export type ShowToast = (type: "success" | "error", message: string) => void;

// ─── Opciones de Hooks ───────────────────────────────────────────────────────

export interface UseProfileNameOptions {
  profile: UserProfile | null;
  showToast: ShowToast;
  onProfileUpdate: (profile: UserProfile) => void;
}

export interface UseProfilePasswordOptions {
  showToast: ShowToast;
}

// ─── Retornos de Hooks ───────────────────────────────────────────────────────

export interface UseProfileNameReturn {
  editingName: boolean;
  setEditingName: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  savingName: boolean;
  handleSaveName: () => Promise<void>;
  cancelEditName: () => void;
}

export interface UseProfilePasswordReturn {
  showPasswordSection: boolean;
  setShowPasswordSection: (v: boolean) => void;
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showCurrentPw: boolean;
  setShowCurrentPw: Dispatch<SetStateAction<boolean>>;
  showNewPw: boolean;
  setShowNewPw: Dispatch<SetStateAction<boolean>>;
  savingPassword: boolean;
  handleChangePassword: (e: FormEvent) => Promise<void>;
  cancelPasswordSection: () => void;
}

export interface UseProfileManagerReturn
  extends UseProfileNameReturn,
    UseProfilePasswordReturn {
  profile: UserProfile | null;
  loading: boolean;
  toast: ToastState;
  setToast: (t: ToastState) => void;
}

// ─── Props de Componentes ────────────────────────────────────────────────────

export interface ProfileCardProps {
  profile: UserProfile;
}

export interface PersonalInfoSectionProps {
  profile: UserProfile;
  editingName: boolean;
  name: string;
  savingName: boolean;
  onStartEdit: () => void;
  onNameChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface ProfileToastProps {
  toast: ToastState;
  onClose: () => void;
}

export interface SecuritySectionProps {
  showPasswordSection: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPw: boolean;
  showNewPw: boolean;
  savingPassword: boolean;
  onOpen: () => void;
  onCancel: () => void;
  onSubmit: (e: FormEvent) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleCurrentPw: () => void;
  onToggleNewPw: () => void;
}
