import { areAdminsManagedByPos } from "@/modules/adminCatalog/users/application/admins-editable";
import AdministradoresView from "./AdministradoresView";

export default function AdminAdministradoresPage() {
  return <AdministradoresView readOnly={areAdminsManagedByPos()} />;
}
