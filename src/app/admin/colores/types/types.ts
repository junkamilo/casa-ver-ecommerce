export interface Color {
  id: string;
  name: string;
  hexCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ToastState = { type: "success" | "error"; message: string } | null;

export interface ColorListProps {
  loading: boolean;
  colors: Color[];
  onEdit: (color: Color) => void;
  onToggleActive: (color: Color) => void;
  onDelete: (color: Color) => void;
}

export interface ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (e: { preventDefault(): void }) => void;
  name: string;
  setName: (v: string) => void;
  hexCode: string;
  setHexCode: (v: string) => void;
  mode?: "create" | "edit";
}
