/**
 * Caché perimetral (CDN / proxy) del menú y de su firma: 60 s frescos y 120 s más sirviendo la copia
 * vieja mientras se revalida. Sin `max-age`, el navegador no la guarda. El webhook del POS purga la caché
 * de datos de Next (tag `pos-categories`); la del borde puede tardar hasta ese TTL.
 */
export const NAV_CATEGORIES_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=120";
