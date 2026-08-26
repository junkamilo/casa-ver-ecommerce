import { prisma as db } from "@/lib/prisma";
import type { CreateCountryInput, UpdateCountryInput } from "../contracts/geography.dto";

export function listAllCountries() {
  return db.country.findMany({
    orderBy: { name: "asc" },
  });
}

export function listActiveCountries() {
  return db.country.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export function findCountryById(id: string) {
  return db.country.findUnique({ where: { id } });
}

export function createCountry(input: CreateCountryInput) {
  return db.country.create({
    data: {
      isoCode2: input.isoCode2,
      isoCode3: input.isoCode3,
      numericCode: input.numericCode ?? null,
      name: input.name.trim(),
      phoneCode: input.phoneCode ?? null,
      currency: input.currency ?? null,
      isActive: input.isActive,
    },
  });
}

export function updateCountry(id: string, input: UpdateCountryInput) {
  return db.country.update({
    where: { id },
    data: {
      ...(input.isoCode2 !== undefined && { isoCode2: input.isoCode2 }),
      ...(input.isoCode3 !== undefined && { isoCode3: input.isoCode3 }),
      ...(input.numericCode !== undefined && { numericCode: input.numericCode ?? null }),
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.phoneCode !== undefined && { phoneCode: input.phoneCode ?? null }),
      ...(input.currency !== undefined && { currency: input.currency ?? null }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
}
