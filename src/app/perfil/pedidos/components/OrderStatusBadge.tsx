import { ORDER_STATUS_CONFIG } from "../constants";
import { OrderStatus } from "../types";

interface Props {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: Props) {
  const config = ORDER_STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
