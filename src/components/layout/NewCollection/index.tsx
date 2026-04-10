import NewCollectionClient from "./components/NewCollectionClient";
import { fetchNewProducts } from "./services/newCollectionService";


const NewCollection = async () => {
  const items = await fetchNewProducts();
  return <NewCollectionClient items={items} />;
};

export default NewCollection;
