export function maskApiKey(apiKey?: string): { length: number; prefix: string } {
    if (!apiKey) {
      return { length: 0, prefix: "no" };
    }
    return {
      length: apiKey.length,
      prefix: apiKey.slice(0, 10) + "...",
    };
  }
  
  export function createMockOrderPayload(customerEmail: string, customerName: string) {
    return {
      customerEmail,
      customerName,
      orderNumber: "TEST-001",
      items: [
        {
          name: "Producto de Prueba",
          quantity: 1,
          price: 99000,
          color: "Verde Militar",
          size: "M",
        },
      ],
      subtotal: 99000,
      shippingCost: 15000,
      discount: 0,
      total: 114000,
    };
  }