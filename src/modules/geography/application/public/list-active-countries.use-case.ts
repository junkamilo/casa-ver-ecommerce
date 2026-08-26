import { listActiveCountries } from "../../infrastructure/prisma-country.repository";
import { cachedGeoRead, registerGeoKey } from "../../infrastructure/geography-cache";
import { toCountryPublicDTO } from "../../presentation/geography.mappers";
import type { CountryPublicDTO } from "../../contracts/geography.dto";

const CACHE_KEY = "countries:active";

export async function listActiveCountriesUseCase(): Promise<CountryPublicDTO[]> {
  registerGeoKey(CACHE_KEY);
  return cachedGeoRead(CACHE_KEY, async () => {
    const countries = await listActiveCountries();
    return countries.map(toCountryPublicDTO);
  });
}
