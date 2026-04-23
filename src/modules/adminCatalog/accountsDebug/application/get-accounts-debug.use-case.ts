import { PrismaAccountRepository } from "../infrastructure/prisma-account.repository";
import { AccountUnauthorizedError } from "./account.errors";
import { calculateTokenStatus } from "../domain/account-debug.entity";
import type { AccountDebugResponseDTO, AccountDebugItemDTO } from "../contracts/account-debug.dto";

const accountRepository = new PrismaAccountRepository();

export async function getAccountsDebugUseCase(userRole?: string): Promise<AccountDebugResponseDTO> {
  // 1. Regla de autorización
  if (userRole !== "ADMIN") {
    throw new AccountUnauthorizedError("No autorizado para ver este recurso");
  }

  // 2. Extracción de datos
  const [accounts, totalUsers] = await Promise.all([
    accountRepository.getAccountsWithUsersForDebug(),
    accountRepository.getTotalUsersCount(),
  ]);

  // 3. Transformación de datos usando lógica de dominio
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cuentas: AccountDebugItemDTO[] = accounts.map((acc: any) => {
    const tokenStatus = calculateTokenStatus(acc.expires_at);

    return {
      proveedor: acc.provider,
      tipo: acc.type,
      alcance: acc.scope ?? null,
      token_vigente: tokenStatus.vigente,
      expira_el: tokenStatus.expiraEl,
      usuario: {
        id: acc.user.id,
        email: acc.user.email,
        nombre: acc.user.name,
        rol: acc.user.role,
        email_verificado: !!acc.user.emailVerified,
        registrado_el: acc.user.createdAt,
      },
    };
  });

  // 4. Armado y retorno del resumen (DTO)
  return {
    resumen: {
      total_usuarios: totalUsers,
      cuentas_oauth: accounts.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      con_google: accounts.filter((a: any) => a.provider === "google").length,
      solo_credenciales: totalUsers - accounts.length,
    },
    cuentas,
  };
}