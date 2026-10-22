import { isShippingManagedByPos } from "@/modules/shipping/application/shipping-editable";
import CiudadesEnviosView from "./CiudadesEnviosView";

export default function CiudadesEnviosPage() {
  return <CiudadesEnviosView readOnly={isShippingManagedByPos()} />;
}
