import { revalidatePath, revalidateTag } from "next/cache";

/** Invalida caché del hero/header tras crear/editar/eliminar slides. */
export function revalidateHeroPages(): void {
  revalidateTag("hero", "max");
  revalidatePath("/");
}
