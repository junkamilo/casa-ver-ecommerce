import { BoldPaymentClient } from "../infrastructure/bold-payment.client";
import { BoldConfigError, BoldGatewayError } from "./bold.errors";
import type { BoldPseBankDTO } from "../contracts/bold.dto";

const client = new BoldPaymentClient();

// listPseBanksUseCase — Devuelve la lista de bancos PSE disponibles.
//
// La página tiene 2 endpoints (/api/payments/pse-banks y /api/payments/bold/pse-banks)
// que hoy NO son consumidos por el frontend (verificado con búsqueda). Se mantienen
// para no introducir cambios de superficie. Ambos endpoints delegan en este use case.
//
// El parámetro `apiKey` se acepta para soportar las dos llaves que las rutas
// originales usaban: BOLD_API_KEY (pse-banks) y BOLD_IDENTITY_KEY (bold/pse-banks).
// Si no se pasa, usa BOLD_IDENTITY_KEY.
export async function listPseBanksUseCase(options?: {
  apiKey?: string;
}): Promise<BoldPseBankDTO[]> {
  const apiKey = options?.apiKey ?? process.env.BOLD_IDENTITY_KEY;
  if (!apiKey) {
    throw new BoldConfigError("Pasarela no configurada");
  }

  const result = await client.listPseBanks(apiKey);
  if (!result.ok) {
    console.error("[BOLD PSE banks] Error:", result.status);
    throw new BoldGatewayError("Error obteniendo lista de bancos PSE", 502);
  }

  return result.banks;
}
