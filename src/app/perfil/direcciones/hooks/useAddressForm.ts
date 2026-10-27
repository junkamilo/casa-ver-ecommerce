"use client";

import { useEffect, useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAddressShippingPreviewAction,
  getPublicDepartmentsAction,
  getPublicMunicipalitiesAction,
} from "@/app/actions/geography";
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
  // Departamentos, municipios y tarifa de envío: los publica el POS.
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [municipiosByDept, setMunicipiosByDept] = useState<{ dept: string; list: string[] } | null>(null);
  const [preview, setPreview] = useState<{ key: string; cost: number; rateName: string | null } | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    getPublicDepartmentsAction().then((list) => {
      if (active) setDepartamentos(list);
    });
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!selectedDepartment) return;
    let active = true;
    getPublicMunicipalitiesAction(selectedDepartment).then((list) => {
      if (active) setMunicipiosByDept({ dept: selectedDepartment, list });
    });
    return () => {
      active = false;
    };
  }, [selectedDepartment]);

  const previewKey = selectedDepartment && selectedCity ? `${selectedDepartment}|${selectedCity}` : "";
  useEffect(() => {
    if (!previewKey) return;
    let active = true;
    const [dept, city] = previewKey.split("|");
    getAddressShippingPreviewAction(city, dept).then((quote) => {
      if (active) setPreview(quote ? { key: previewKey, ...quote } : null);
    });
    return () => {
      active = false;
    };
  }, [previewKey]);

  const municipios = selectedDepartment && municipiosByDept?.dept === selectedDepartment ? municipiosByDept.list : [];
  const shippingCost = preview && preview.key === previewKey ? preview.cost : 0;
  const shippingRateName = preview && preview.key === previewKey ? preview.rateName : null;

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
    departamentos,
    municipios,
    shippingCost,
    shippingRateName,
  };
}
