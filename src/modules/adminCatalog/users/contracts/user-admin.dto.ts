export type AdminUserDTO = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  image?: string | null;
};

export type AdminLookupResponseDTO =
  | { exists: false }
  | {
      exists: true;
      isAdmin: boolean;
      user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
      };
    };
