import AdminToast from "@/app/admin/components/AdminToast";
import type { ProfileToastProps } from "../types/types";

/** Reexporta el toast global del admin (estilo unificado). */
export default function ProfileToast({ toast, onClose }: ProfileToastProps) {
  return <AdminToast toast={toast} onClose={onClose} />;
}
