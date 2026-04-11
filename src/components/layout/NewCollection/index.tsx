import NewCollectionClient from "./components/NewCollectionClient";
import { fetchNewProducts } from "./services/newCollectionService";


const NewCollection = async () => {
  const { items, hasMore } = await fetchNewProducts();
  return <NewCollectionClient items={items} hasMore={hasMore} />;
};

export default NewCollection;
