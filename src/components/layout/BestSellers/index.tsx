import { fetchFeaturedProducts } from "./services";
import { BestSellersClient } from "./components";
import { unstable_cache } from "next/cache";

// ✅ Cache featured products por 1 hora (3600 segundos)
// Revalidación automática en: visitantes nuevos después de 1h, o bajo demanda
const getCachedFeaturedProducts = unstable_cache(
  async () => fetchFeaturedProducts(),
  ["featured-products"], // Clave de cache
  { revalidate: 3600, tags: ["products"] } // Revalidar cada 1h
);

const BestSellers = async () => {
  const items = await getCachedFeaturedProducts();
  return <BestSellersClient items={items} />;
};

export default BestSellers;
