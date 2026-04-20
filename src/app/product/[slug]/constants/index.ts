export const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-CO")}`;
}

export const PRODUCTION_TIME_CONTENT = [
  "Nuestras prendas son elaboradas artesanalmente con dedicación y cuidado.",
  "El tiempo estimado de confección es de 5 a 10 días hábiles a partir de la confirmación del pago.",
  "Para pedidos con personalización o en tallas especiales, el tiempo puede extenderse de 10 a 15 días hábiles.",
  "Te notificaremos por correo cuando tu pedido esté listo para envío.",
];

export const CARE_INSTRUCTIONS = [
  "Lavar a mano o en ciclo suave.",
  "No retorcer para evitar deformar la prenda.",
  "Secar a la sombra y en superficie plana o colgado.",
  "No usar secadora para conservar la textura y el color del tejido.",
  "Usar jabón suave; evitar detergentes fuertes o con blanqueador.",
  "Lavar por separado o con prendas de colores similares.",
  "No dejar en remojo por tiempos prolongados.",
  "Planchar a temperatura baja o media, preferiblemente por el revés.",
  "Evitar el contacto directo con superficies ásperas o accesorios que puedan generar fricción.",
  "Guardar en un lugar fresco y seco.",
];
