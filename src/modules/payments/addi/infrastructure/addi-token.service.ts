// ---------------------------------------------------------------------------
// Addi — Servicio de autenticación OAuth2 (client_credentials)
//
// Addi usa Auth0 como proveedor de identidad. Este módulo obtiene y cachea
// el JWT Bearer necesario para llamar a la API de Addi.
//
// Flujo:
//   POST {ADDI_AUTH_URL}
//   body: { client_id, client_secret, audience, grant_type }
//   respuesta: { access_token, expires_in, token_type }
// ---------------------------------------------------------------------------

interface TokenCache {
  token: string;
  expiresAt: number; // timestamp ms
}

// Cache en memoria (válido solo durante el proceso Node.js — OK para serverless con warm starts)
let cache: TokenCache | null = null;

// Margen de seguridad: renovar el token 60 s antes de que expire
const EXPIRY_BUFFER_MS = 60_000;

export async function getAddiToken(): Promise<string> {
  const now = Date.now();

  // Devolver token cacheado si aún es válido
  if (cache && now < cache.expiresAt) {
    return cache.token;
  }

  const clientId = process.env.ADDI_CLIENT_ID;
  const clientSecret = process.env.ADDI_CLIENT_SECRET;
  const authUrl = process.env.ADDI_AUTH_URL;
  // ADDI_AUDIENCE es el identificador lógico de la API en Auth0.
  // Es DISTINTO a ADDI_API_URL (la URL real del servidor de Addi).
  const audience = process.env.ADDI_AUDIENCE;

  if (!clientId || !clientSecret || !authUrl || !audience) {
    throw new Error(
      "[Addi Auth] Variables de entorno faltantes: ADDI_CLIENT_ID, ADDI_CLIENT_SECRET, ADDI_AUTH_URL, ADDI_AUDIENCE"
    );
  }

  const res = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience,
      grant_type: "client_credentials",
    }),
    // No seguir redirects en la solicitud de token
    redirect: "follow",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Addi Auth] Error obteniendo token (${res.status}): ${body}`);
  }

  const data = await res.json();
  const { access_token, expires_in } = data as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  if (!access_token) {
    throw new Error("[Addi Auth] La respuesta no contiene access_token");
  }

  // Cachear token
  cache = {
    token: access_token,
    expiresAt: now + expires_in * 1000 - EXPIRY_BUFFER_MS,
  };

  return access_token;
}
