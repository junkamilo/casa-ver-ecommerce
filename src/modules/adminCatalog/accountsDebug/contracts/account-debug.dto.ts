export interface AccountDebugUserDTO {
    id: string;
    email: string | null;
    nombre: string | null;
    rol: string;
    email_verificado: boolean;
    registrado_el: Date;
  }
  
  export interface AccountDebugItemDTO {
    proveedor: string;
    tipo: string;
    alcance: string | null;
    token_vigente: boolean | null;
    expira_el: string | null;
    usuario: AccountDebugUserDTO;
  }
  
  export interface AccountDebugSummaryDTO {
    total_usuarios: number;
    cuentas_oauth: number;
    con_google: number;
    solo_credenciales: number;
  }
  
  export interface AccountDebugResponseDTO {
    resumen: AccountDebugSummaryDTO;
    cuentas: AccountDebugItemDTO[];
  }