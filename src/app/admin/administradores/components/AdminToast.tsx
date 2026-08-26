import AdminToast from "@/app/admin/components/AdminToast";
import type { AdminToastProps } from "../types/types";

/** Reexporta el toast global del admin (estilo unificado). */
const AdministratorsToast = ({ toast, onClose }: AdminToastProps) => {
  return <AdminToast toast={toast} onClose={onClose} />;
};

export default AdministratorsToast;
