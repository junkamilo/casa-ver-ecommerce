import type { ShippingCityDTO, ShippingDepartmentDTO, ShippingRateDTO } from "@/modules/shipping/contracts/shipping.dto";

export type { ShippingCityDTO, ShippingDepartmentDTO, ShippingRateDTO };

export interface ShippingCitiesTableProps {
  cities: ShippingCityDTO[];
  search: string;
  onSearchChange: (value: string) => void;
  onRemove: (id: string) => void;
}

export interface DepartmentsTableProps {
  departments: ShippingDepartmentDTO[];
  rates: ShippingRateDTO[];
  onAssign: (departmentId: string, shippingRateId: string) => void;
}
