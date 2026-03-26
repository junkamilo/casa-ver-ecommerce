export interface SavedAddress {
  id: string;
  fullName: string;
  cedula: string | null;
  phone: string;
  department: string;
  city: string;
  address: string;
  addressDetail: string | null;
  zipCode: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressFormValues {
  fullName: string;
  cedula: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  addressDetail: string;
  zipCode: string;
  isDefault: boolean;
}
