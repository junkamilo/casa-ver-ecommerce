export function calculateTokenStatus(expiresAt: number | null): { 
    vigente: boolean | null; 
    expiraEl: string | null; 
  } {
    if (!expiresAt) {
      return { vigente: null, expiraEl: null };
    }
    
    const expiresMs = expiresAt * 1000;
    return {
      vigente: expiresMs > Date.now(),
      expiraEl: new Date(expiresMs).toISOString(),
    };
  }