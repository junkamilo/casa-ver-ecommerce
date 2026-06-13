import { revalidatePath, revalidateTag } from "next/cache";

/** Invalida caché de listados públicos tras crear/editar/eliminar productos. */
export function revalidateProductListings(): void {
  revalidateTag("products", "max");
  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath("/collections/mas-vendidos");
  revalidatePath("/collections/nueva-coleccion");
  revalidatePath("/collections", "layout");
}
