import NewCollectionClient from "./components/NewCollectionClient";
import { fetchNewProducts } from "./services/newCollectionService";
import { unstable_cache } from "next/cache";

// ✅ Cache nuevos productos por 1 hora (3600 segundos)
const getCachedNewProducts = unstable_cache(
  async () => fetchNewProducts(),
  ["new-products"],
  { revalidate: 3600, tags: ["products"] }
);

const NewCollection = async () => {
  const { items, hasMore } = await getCachedNewProducts();
  return <NewCollectionClient items={items} hasMore={hasMore} />;
};

export default NewCollection;
