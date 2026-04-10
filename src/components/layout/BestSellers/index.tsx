import { fetchFeaturedProducts } from "./services";
import { BestSellersClient } from "./components";

const BestSellers = async () => {
  const items = await fetchFeaturedProducts();
  return <BestSellersClient items={items} />;
};

export default BestSellers;
