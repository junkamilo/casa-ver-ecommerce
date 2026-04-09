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
