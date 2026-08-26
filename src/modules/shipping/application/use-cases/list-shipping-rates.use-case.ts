import { listShippingRatesDb } from "../../infrastructure/prisma-shipping-rate.repository";

export async function listShippingRatesUseCase() {
  const rates = await listShippingRatesDb();
  return rates.map((rate) => ({
    id: rate.id,
    name: rate.name,
    price: rate.price,
    departmentsCount: 0,
    citiesCount: rate._count.municipalities,
  }));
}
