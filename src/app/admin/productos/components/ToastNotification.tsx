import AdminToast from "@/app/admin/components/AdminToast";
import { ToastNotificationProps } from "../types";

/** Reexporta el toast global del admin (estilo unificado). */
export default function ToastNotification({ toast }: ToastNotificationProps) {
  return <AdminToast toast={toast} />;
}
