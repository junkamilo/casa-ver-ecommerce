import { getPosCategoryTree } from "@/modules/posIntegration/application/get-pos-categories.use-case";
import { toPosNavCategories } from "@/modules/posIntegration/domain/pos-category-view";
import HeaderClient from "./HeaderClient";

/** Menú de categorías: 100 % el árbol del POS (sin POS o sin categorías creadas, el menú queda vacío). */
export default async function HeaderAsync() {
  return <HeaderClient categories={toPosNavCategories(await getPosCategoryTree())} />;
}
