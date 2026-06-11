import type {
  AdminUiModel,
  LookupResultUiModel,
} from "@/modules/adminCatalog/users/presentation/mappers";

// ── Entidades ────────────────────────────────────────────────────────────────

export type Admin = AdminUiModel;
export type LookupResult = LookupResultUiModel;

export type ToastState = { type: "success" | "error"; message: string } | null;

// ── Props compartidas ────────────────────────────────────────────────────────

/** Props de delete compartidas por AdminTable y AdminMobileList */
export interface AdminDeleteProps {
  confirmDelete: string | null;
  deleting: boolean;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onDelete: (id: string) => void;
}

// ── Props de componentes ─────────────────────────────────────────────────────

export interface AdminTableProps extends AdminDeleteProps {
  filteredAdmins: Admin[];
  currentUserId: string | undefined;
}

export interface AdminMobileListProps extends AdminDeleteProps {
  filteredAdmins: Admin[];
  currentUserId: string | undefined;
}

export interface AdminStatsBarProps {
  total: number;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface AdminToastProps {
  toast: ToastState;
  onClose: () => void;
}

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (e: { preventDefault(): void }) => Promise<void>;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  lookupResult: LookupResult | null;
  lookingUp: boolean;
  lookupDone: boolean;
  isExistingUser: boolean;
  isAlreadyAdmin: boolean;
  onGeneratePassword: () => void;
  onCopyPassword: () => void;
}
