import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// COUNTRY
// ═══════════════════════════════════════════════════════════════

export const CreateCountrySchema = z.object({
  isoCode2: z
    .string()
    .length(2, "Código ISO alpha-2 debe tener 2 caracteres")
    .toUpperCase(),
  isoCode3: z
    .string()
    .length(3, "Código ISO alpha-3 debe tener 3 caracteres")
    .toUpperCase(),
  numericCode: z
    .string()
    .regex(/^\d{3}$/, "Código numérico ISO debe tener 3 dígitos")
    .optional(),
  name: z.string().min(2, "Nombre de país muy corto").max(100),
  phoneCode: z
    .string()
    .regex(/^\+\d{1,4}$/, "Formato: +57")
    .optional(),
  currency: z
    .string()
    .length(3, "Código de moneda debe ser de 3 letras (ej. COP)")
    .toUpperCase()
    .optional(),
  isActive: z.boolean().default(true),
});

export const UpdateCountrySchema = CreateCountrySchema.partial();

export type CreateCountryInput = z.infer<typeof CreateCountrySchema>;
export type UpdateCountryInput = z.infer<typeof UpdateCountrySchema>;

// ═══════════════════════════════════════════════════════════════
// DEPARTMENT
// ═══════════════════════════════════════════════════════════════

export const CreateDepartmentSchema = z.object({
  countryId: z.string().cuid("ID de país inválido"),
  daneCode: z
    .string()
    .regex(/^\d{2}$/, "DANE departamental: 2 dígitos (ej. 08)")
    .optional(),
  name: z.string().min(2, "Nombre muy corto").max(100),
  isActive: z.boolean().default(true),
});

// No se mueve un departamento de país una vez creado
export const UpdateDepartmentSchema = CreateDepartmentSchema
  .omit({ countryId: true })
  .partial();

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;

// ═══════════════════════════════════════════════════════════════
// MUNICIPALITY
// ═══════════════════════════════════════════════════════════════

export const CreateMunicipalitySchema = z.object({
  departmentId: z.string().cuid("ID de departamento inválido"),
  daneCode: z
    .string()
    .regex(/^\d{5}$/, "DANE municipal: 5 dígitos (ej. 08001)")
    .optional(),
  name: z.string().min(2, "Nombre muy corto").max(100),
  isActive: z.boolean().default(true),
});

// No se mueve un municipio de departamento una vez creado
export const UpdateMunicipalitySchema = CreateMunicipalitySchema
  .omit({ departmentId: true })
  .partial();

export type CreateMunicipalityInput = z.infer<typeof CreateMunicipalitySchema>;
export type UpdateMunicipalityInput = z.infer<typeof UpdateMunicipalitySchema>;

// ═══════════════════════════════════════════════════════════════
// DTOs DE SALIDA (lo que ve el front, sin campos internos)
// ═══════════════════════════════════════════════════════════════

export type CountryPublicDTO = {
  id: string;
  isoCode2: string;
  name: string;
  phoneCode: string | null;
};

export type DepartmentPublicDTO = {
  id: string;
  name: string;
  daneCode: string | null;
};

export type MunicipalityPublicDTO = {
  id: string;
  name: string;
  daneCode: string | null;
};

// Admin DTOs (incluyen isActive y relaciones)
export type CountryAdminDTO = {
  id: string;
  isoCode2: string;
  isoCode3: string;
  numericCode: string | null;
  name: string;
  phoneCode: string | null;
  currency: string | null;
  isActive: boolean;
};

export type DepartmentAdminDTO = {
  id: string;
  countryId: string;
  daneCode: string | null;
  name: string;
  normalizedName: string;
  isActive: boolean;
  countryName: string;
};

export type MunicipalityAdminDTO = {
  id: string;
  departmentId: string;
  daneCode: string | null;
  name: string;
  normalizedName: string;
  isActive: boolean;
  departmentName: string;
  shippingRateId?: string | null;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
