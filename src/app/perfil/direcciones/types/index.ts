import { useForm, useController } from "react-hook-form";

// ── Dominio ───────────────────────────────────────────────────────────────────

export interface SavedAddress {
  id: string;
  fullName: string;
  cedula: string | null;
  phone: string;
  department: string;
  city: string;
  address: string;
  addressDetail: string | null;
  zipCode: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressFormValues {
  fullName: string;
  cedula: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  addressDetail: string;
  zipCode: string;
  isDefault: boolean;
}

// ── Hook useAddresses ─────────────────────────────────────────────────────────

export interface UseAddressesResult {
  addresses: SavedAddress[];
  loading: boolean;
  error: string | null;
  modalOpen: boolean;
  editingAddress: SavedAddress | null;
  openCreate: () => void;
  openEdit: (address: SavedAddress) => void;
  closeModal: () => void;
  saveAddress: (values: AddressFormValues) => Promise<{ ok: boolean; error?: string }>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefault: (id: string) => Promise<boolean>;
  submitting: boolean;
}

// ── Hook useAddressForm ───────────────────────────────────────────────────────

export interface UseAddressFormOptions {
  open: boolean;
  editing: SavedAddress | null;
}

export interface UseAddressFormResult {
  register: ReturnType<typeof useForm<AddressFormValues>>["register"];
  handleSubmit: ReturnType<typeof useForm<AddressFormValues>>["handleSubmit"];
  errors: ReturnType<typeof useForm<AddressFormValues>>["formState"]["errors"];
  deptField: ReturnType<typeof useController<AddressFormValues, "department">>["field"];
  cityField: ReturnType<typeof useController<AddressFormValues, "city">>["field"];
  selectedDepartment: string;
  /** Departamentos y municipios con cobertura según el POS. */
  departamentos: string[];
  municipios: string[];
  /** Costo de envío calculado para la ciudad seleccionada (0 si no hay ciudad elegida) */
  /** Tarifa de envío a la ciudad elegida (POS); 0 = sin calcular. */
  shippingCost: number;
  shippingRateName: string | null;
}

// ── Hook useAddressCard ───────────────────────────────────────────────────────

export interface UseAddressCardOptions {
  addressId: string;
  onDelete: (id: string) => Promise<boolean>;
  onSetDefault: (id: string) => Promise<boolean>;
}

export interface UseAddressCardResult {
  confirmDelete: boolean;
  actionLoading: "delete" | "default" | null;
  isLoading: boolean;
  handleDelete: () => Promise<void>;
  handleSetDefault: () => Promise<void>;
  cancelDelete: () => void;
}

// ── Props de componentes ──────────────────────────────────────────────────────

export interface AddressCardProps {
  address: SavedAddress;
  onEdit: (address: SavedAddress) => void;
  onDelete: (id: string) => Promise<boolean>;
  onSetDefault: (id: string) => Promise<boolean>;
  disabled?: boolean;
}

export interface AddressFormModalProps {
  open: boolean;
  editing: SavedAddress | null;
  submitting: boolean;
  onSave: (values: AddressFormValues) => Promise<{ ok: boolean; error?: string }>;
  onClose: () => void;
}

export interface AddressEmptyStateProps {
  onAdd: () => void;
}

export interface FieldErrorProps {
  message?: string;
}
