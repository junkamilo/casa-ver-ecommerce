import { UserProfile } from "../../types";

// ── Props de componentes ──────────────────────────────────────────────────────

export interface ProfileInfoSectionProps {
  profile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
  onToast: (type: "success" | "error", message: string) => void;
}

// ── Hook useProfileInfo ───────────────────────────────────────────────────────

export interface UseProfileInfoOptions {
  profile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
  onToast: (type: "success" | "error", message: string) => void;
}

export interface UseProfileInfoResult {
  // Name editing
  editingName: boolean;
  name: string;
  savingName: boolean;
  setName: (n: string) => void;
  startEditName: () => void;
  cancelEditName: () => void;
  handleSaveName: () => Promise<void>;
  // Phone editing
  editingPhone: boolean;
  phone: string;
  savingPhone: boolean;
  setPhone: (v: string) => void;
  startEditPhone: () => void;
  cancelEditPhone: () => void;
  handleSavePhone: () => Promise<void>;
  // Cedula editing
  editingCedula: boolean;
  cedula: string;
  savingCedula: boolean;
  setCedula: (v: string) => void;
  startEditCedula: () => void;
  cancelEditCedula: () => void;
  handleSaveCedula: () => Promise<void>;
  // Recovery email editing
  editingRecoveryEmail: boolean;
  recoveryEmail: string;
  savingRecoveryEmail: boolean;
  setRecoveryEmail: (v: string) => void;
  startEditRecoveryEmail: () => void;
  cancelEditRecoveryEmail: () => void;
  handleSaveRecoveryEmail: () => Promise<void>;
  // Password
  showPasswordSection: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPw: boolean;
  showNewPw: boolean;
  savingPassword: boolean;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  toggleCurrentPw: () => void;
  toggleNewPw: () => void;
  showPasswordForm: () => void;
  cancelPasswordForm: () => void;
  handleChangePassword: (e: React.FormEvent) => Promise<void>;
}
