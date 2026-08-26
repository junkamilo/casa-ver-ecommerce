import { z } from "zod";

export const UpdateShippingConfigSchema = z.object({
  freeShippingThreshold: z.coerce.number().min(0),
  defaultRateId: z.string().optional(),
});

export type UpdateShippingConfigDTO = z.infer<typeof UpdateShippingConfigSchema>;

export type ShippingConfigDTO = {
  freeShippingThreshold: number;
  defaultRateId: string | null;
};

export const CreateShippingRateSchema = z.object({
  name: z.string().trim().max(60, "Nombre demasiado largo").optional().nullable(),
  price: z.coerce.number().int().min(0),
});

export type CreateShippingRateDTO = z.infer<typeof CreateShippingRateSchema>;

export const UpdateShippingRateSchema = z.object({
  name: z.string().trim().max(60, "Nombre demasiado largo").optional().nullable(),
  price: z.coerce.number().int().min(0).optional(),
});

export type UpdateShippingRateDTO = z.infer<typeof UpdateShippingRateSchema>;

export const AssignCityRateSchema = z.object({
  cityId: z.string().min(1),
  shippingRateId: z.string().min(1),
});

export type AssignCityRateDTO = z.infer<typeof AssignCityRateSchema>;



export type ShippingRateDTO = {
  id: string;
  name: string | null;
  price: number;
  departmentsCount: number;
  citiesCount: number;
};

export type ShippingRateRefDTO = {
  id: string;
  name: string | null;
  price: number;
};

export type CatalogCityDTO = {
  id: string;
  name: string;
  department: {
    name: string;
    shippingRate: ShippingRateRefDTO | null;
  };
};

export type ShippingCityDTO = CatalogCityDTO & {
  shippingRate: ShippingRateRefDTO;
};

export type ShippingDepartmentDTO = {
  id: string;
  name: string;
  shippingRate: ShippingRateRefDTO;
};
