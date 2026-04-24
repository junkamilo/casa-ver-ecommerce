import type { AdminColorUiModel } from "@/modules/adminCatalog/colors/presentation/mappers";

export type Color = AdminColorUiModel;

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
