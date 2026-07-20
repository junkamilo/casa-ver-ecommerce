/**

 * Hosts de media permitidos para validar URLs de imágenes/videos en admin.

 */

const ALLOWED_MEDIA_HOSTS = new Set([

  "media.casaverdeoficial.com",

  "casa-verde-cdn.b-cdn.net",

]);



export function isAllowedMediaHost(hostname: string): boolean {

  return ALLOWED_MEDIA_HOSTS.has(hostname.toLowerCase());

}



export function isValidMediaUrl(v: unknown): boolean {

  if (typeof v !== "string" || !v.trim()) return false;

  try {

    const u = new URL(v);

    return u.protocol === "https:" && isAllowedMediaHost(u.hostname);

  } catch {

    return false;

  }

}



export function isBunnyCdnUrl(url: string): boolean {

  try {

    const u = new URL(url);

    return (

      u.hostname === "media.casaverdeoficial.com" ||

      u.hostname === "casa-verde-cdn.b-cdn.net"

    );

  } catch {

    return false;

  }

}


