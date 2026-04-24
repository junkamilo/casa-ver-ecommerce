import { DollarSign, Package, ShoppingCart, Star, Users } from "lucide-react";
import type { DashboardDataDTO } from "../contracts/dashboard.dto";
import type { DashboardDataViewModel } from "./types";

const ICON_MAP = {
  dollar: DollarSign,
  cart: ShoppingCart,
  package: Package,
  users: Users,
  star: Star,
} as const;

export function mapDashboardDataDtoToUi(dto: DashboardDataDTO): DashboardDataViewModel {
  return {
    stats: dto.stats.map((stat) => ({
      ...stat,
      icon: ICON_MAP[stat.icon],
    })),
    recentOrders: dto.recentOrders,
  };
}
