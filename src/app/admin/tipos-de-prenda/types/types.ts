// ── Entidades ─────────────────────────────────────────────────────────────────

export interface GarmentType {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  _count?: {
    products: number;
    items: number;
  };
}

export type ToastState = { type: "success" | "error"; message: string } | null;

// ── Props ─────────────────────────────────────────────────────────────────────

export interface GarmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (e: { preventDefault(): void }) => Promise<void>;
  name: string;
  setName: (v: string) => void;
  mode?: "create" | "edit";
}

export interface GarmentTypeListProps {
  loading: boolean;
  garmentTypes: GarmentType[];
  onEdit: (gt: GarmentType) => void;
  onToggleActive: (gt: GarmentType) => void;
  onDelete: (gt: GarmentType) => void;
}
