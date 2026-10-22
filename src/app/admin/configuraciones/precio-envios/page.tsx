import { isShippingManagedByPos } from "@/modules/shipping/application/shipping-editable";
import PrecioEnviosView from "./PrecioEnviosView";

export default function PrecioEnviosPage() {
  return <PrecioEnviosView readOnly={isShippingManagedByPos()} />;
}
