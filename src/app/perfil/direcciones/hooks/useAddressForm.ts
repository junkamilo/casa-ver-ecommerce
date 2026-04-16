"use client";

import { useEffect } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEPARTAMENTOS, MUNICIPIOS } from "@/lib/constants/colombia";
import { getShippingCost } from "@/lib/shipping";
import { AddressFormValues, UseAddressFormOptions, UseAddressFormResult } from "../types";
import { addressSchema, ADDRESS_FORM_DEFAULTS } from "../constants";

export function useAddressForm({ open, editing }: UseAddressFormOptions): UseAddressFormResult {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: ADDRESS_FORM_DEFAULTS,
  });

  const { field: deptField } = useController<AddressFormValues, "department">({
    control,
    name: "department",
  });
  const { field: cityField } = useController<AddressFormValues, "city">({
    control,
    name: "city",
  });

  const selectedDepartment = deptField.value;
  const selectedCity = cityField.value;
  const municipios = selectedDepartment ? (MUNICIPIOS[selectedDepartment] ?? []) : [];
  const shippingCost =
    selectedDepartment && selectedCity
      ? getShippingCost(selectedCity, selectedDepartment)
      : 0;

  // Rellena o limpia el formulario cuando se abre el modal
  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        fullName:      editing.fullName,
        cedula:        editing.cedula ?? "",
        phone:         editing.phone,
        department:    editing.department,
        city:          editing.city,
        address:       editing.address,
        addressDetail: editing.addressDetail ?? "",
        zipCode:       editing.zipCode ?? "",
        isDefault:     editing.isDefault,
      });
    } else {
      reset(ADDRESS_FORM_DEFAULTS);
    }
  }, [open, editing, reset]);

  return {
    register,
    handleSubmit,
    errors,
    deptField,
    cityField,
    selectedDepartment,
    municipios,
    shippingCost,
  };
}
