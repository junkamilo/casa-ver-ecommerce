export interface SavedAddress {
  id: string;
  fullName: string;
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
  phone: string;
  department: string;
  city: string;
  address: string;
  addressDetail: string;
  zipCode: string;
  isDefault: boolean;
}
