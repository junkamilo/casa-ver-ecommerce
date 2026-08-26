import AdminToast from "@/app/admin/components/AdminToast";
import type { CategoryToastProps } from "../types/types";

/** Reexporta el toast global del admin (estilo unificado). */
const CategoryToast = ({ toast }: CategoryToastProps) => {
  return <AdminToast toast={toast} />;
};

export default CategoryToast;
